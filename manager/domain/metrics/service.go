package metrics

import (
	"context"
	"encoding/json"
	"fmt"
	"k8s.io/client-go/tools/clientcmd"
	"math"
	"os"

	"github.com/go-resty/resty/v2"
	"github.com/sirupsen/logrus"
	"gitlab.com/labtek/telunjuk/manager/common"
	"gitlab.com/labtek/telunjuk/manager/configuration"
	"gitlab.com/labtek/telunjuk/manager/domain/metrics/message"
	"gitlab.com/labtek/telunjuk/manager/domain/metrics/model"
	"gitlab.com/labtek/telunjuk/manager/infrastructure/database"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/uuid"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/scheme"
	v1 "k8s.io/client-go/kubernetes/typed/apps/v1"
	"k8s.io/client-go/rest"
)

var kubeconfig *string
var query []string
var isScalingUp bool

// Service responsible for upscale and downscale worker
type Service struct {
	config        *configuration.Config
	clientset     *kubernetes.Clientset
	deploymentset v1.DeploymentInterface
	repository    *database.Repository
}

// NewService initiate new metrics service
func NewService(local bool, path string, cfg *configuration.Config) *Service {
	query = append(query, "feeder", "fetcher", "extractor")
	var config *rest.Config
	var err error

	if local {
		config, err = clientcmd.BuildConfigFromFlags("", path)
	} else {
		config, err = rest.InClusterConfig()
	}

	if err != nil {
		panic(err)
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err)

	}

	// cron, err := CreateCleanerCronJob(clientset)
	// if err != nil {
	//	logrus.Panic(err)
	// }

	repository := database.NewRepository(cfg.Database.Host, cfg.Database.DbName)
	deploymentsClient := clientset.AppsV1().Deployments(apiv1.NamespaceDefault)
	return &Service{clientset: clientset, deploymentset: deploymentsClient, config: cfg, repository: repository}
}

// GetPods list pods on a namespace
func (s *Service) GetMetrics() *common.ServiceResponse {
	rabbitResult := s.watchRabbit()
	if rabbitResult.ErrorInstance() != nil {
		logrus.Error(rabbitResult.ErrorInstance())
		return common.NewInternalError(rabbitResult.ErrorInstance())
	}

	rabbitStat := rabbitResult.Data.([]model.Message)

	var result []message.RetrieveMessage

	if len(rabbitStat) == 3 {
		for i := 0; i < len(query); i++ {
			pods, err := s.clientset.CoreV1().Pods(query[i]).List(context.TODO(), metav1.ListOptions{
				FieldSelector: "status.phase!=Succeeded",
			})
			if err != nil {
				logrus.Error(err)
				return common.NewInternalError(err)
			}

			count := float64(0)
			if len(rabbitStat) >= len(query) {
				if len(rabbitStat[i].Items) > 0 {
					count = rabbitStat[i].Items[0].MessageReady
				}
			}

			item := message.RetrieveMessage{
				Worker:  query[i],
				Message: count,
				Count:   len(pods.Items),
			}
			result = append(result, item)
		}
	}

	return common.NewSuccess(result)
}

func (s *Service) getLimit(serviceName string) int {
	if serviceName == "fetcher" {
		return s.config.Fetcher
	}

	if serviceName == "feeder" {
		return s.config.Feeder
	}

	return s.config.Extractor
}

// Upscale a pod
func (s *Service) Upscale(serviceName string) *common.ServiceResponse {
	if _, err := s.checkNamespace(serviceName); err != nil {
		logrus.Error(err)
		return common.NewInternalError(err)
	}

	count, err := s.clientset.CoreV1().Pods(serviceName).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		logrus.Error(err)
	}

	if len(count.Items) == s.getLimit(serviceName) {
		return common.NewSuccess(fmt.Sprintf("Limit for %s is reached", serviceName))
	}

	// read yaml from configmap
	namespace := "default"
	if os.Getenv("TELUNJUK_NAMESPACE") != "" {
		namespace = os.Getenv("TELUNJUK_NAMESPACE")
	}

	name := fmt.Sprintf("%s-%s", serviceName, uuid.NewUUID())
	maps, err := s.clientset.CoreV1().ConfigMaps(namespace).Get(context.TODO(), serviceName, metav1.GetOptions{})
	yamlFile := maps.Data[fmt.Sprintf("%s.yml", serviceName)]

	// transform yaml to Pod object
	obj, _, err := scheme.Codecs.UniversalDeserializer().Decode([]byte(yamlFile), nil, nil)
	if err != nil {
		return common.NewInternalError(err)
	}

	pod := obj.(*apiv1.Pod)
	pod.ObjectMeta = metav1.ObjectMeta{Name: name}

	result, err := s.clientset.CoreV1().Pods(serviceName).Create(context.TODO(), pod, metav1.CreateOptions{})
	logrus.Infof("success deploy pod %s", result.Name)
	if err != nil {
		return common.NewInternalError(fmt.Errorf("failed to deploy pod for service: %s, caused by: %v", serviceName, err))
	}

	pods, err := s.clientset.CoreV1().Pods(serviceName).List(context.TODO(), metav1.ListOptions{})
	return common.NewSuccess(pods)
}

// Auto scale services
func (s *Service) Autoscale() {
	data := s.GetMetrics().Data.([]message.RetrieveMessage)
	localConfig := s.getConfig()

	go func() {
		logrus.Infof("starting check: %s", data[0].Worker)
		s.scaleup(data[0], localConfig.Feeder, s.config.Feeder)
	}()

	go func() {
		logrus.Infof("starting check: %s", data[1].Worker)
		s.scaleup(data[1], localConfig.Fetcher, s.config.Fetcher)
	}()

	go func() {
		logrus.Infof("starting check: %s", data[2].Worker)
		s.scaleup(data[2], localConfig.Extractor, s.config.Extractor)
	}()
}

// /---PRIVATE FUNCTION---

// getConfig function
func (s *Service) getConfig() *model.Config {
	return s.repository.Get("config")
}

// scaleup function
func (s *Service) scaleup(data message.RetrieveMessage, config int32, limit int) {

	// Dont spawn if zero config
	if config == 0 {
		logrus.Infof("Do nothing when zero config")
		return
	}

	worker_number := float64(data.Message) / float64(config)
	roundup := 1

	logrus.Infof("calculated worker for %s : %f, limit:%d", data.Worker, worker_number, limit)

	if worker_number > 0 {
		roundup = int(math.Ceil(worker_number))
	}

	if roundup > int(limit) {
		roundup = int(limit)
	}

	logrus.Infof("roundup worker for %s : %d", data.Worker, roundup)
	logrus.Infof("Checking on %s , current workers: %d, job per worker: %d, expected workers: %d, queue: %f", data.Worker, data.Count, config, roundup, data.Message)

	if roundup > data.Count {

		// upscale as many as roundup calculation
		limit := roundup - data.Count
		logrus.Infof("start scaling %d for %s", limit, data.Worker)
		for i := 0; i < limit; i++ {
			result := s.Upscale(data.Worker)
			// log if error
			if result.ErrorInstance() != nil {
				logrus.Errorf("Error Scaleup %s", result.Error())
			}
		}
	}
}

// WatchRabbit get number of queue on rabbit mq
func (s *Service) watchRabbit() *common.ServiceResponse {
	var result []model.Message

	for i := 0; i < len(query); i++ {
		var value model.Message
		var url = fmt.Sprintf("http://%s:%d/api/queues?page=1&page_size=1&name=%s&use_regex=false&pagination=false", s.config.Broker.Host, s.config.Broker.HttpPort, query[i])
		client := resty.New()

		resp, err := client.SetDisableWarn(true).R().SetBasicAuth(s.config.Broker.User, s.config.Broker.Password).Get(url)

		if err != nil {
			logrus.Errorf("error watch rabbit: %s", err)
			common.NewInternalError(err)
		}

		b := resp.Body()
		if err := json.Unmarshal(b, &value); err != nil {
			logrus.Error(err)
			common.NewInternalError(err)
		}
		result = append(result, value)
	}
	return common.NewSuccess(result)
}

// CheckNamespace and create if not exist
func (s *Service) checkNamespace(name string) (bool, error) {
	result, err := s.clientset.CoreV1().Namespaces().Get(context.TODO(), name, metav1.GetOptions{})
	if err != nil && err.Error() != fmt.Sprintf("namespaces \"%s\" not found", name) {
		return false, err
	}
	if result.Name != "" {
		return true, nil
	}
	return s.createNamespace(name)
}

// CreateNamespace from user input
func (s *Service) createNamespace(name string) (bool, error) {
	namespace := &apiv1.Namespace{
		TypeMeta: metav1.TypeMeta{},
		ObjectMeta: metav1.ObjectMeta{
			Name: name,
		},
		Spec:   apiv1.NamespaceSpec{},
		Status: apiv1.NamespaceStatus{},
	}
	result, err := s.clientset.CoreV1().Namespaces().Create(context.TODO(), namespace, metav1.CreateOptions{})
	if err != nil {
		logrus.Error(err)
		return false, err
	}
	logrus.Print(result.Status)
	return true, nil
}

func int32Ptr(i int32) *int32 { return &i }
