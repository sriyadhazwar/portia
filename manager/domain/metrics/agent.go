package metrics

import (
	"context"
	"os"

	"github.com/sirupsen/logrus"
	v1 "k8s.io/api/batch/v1"
	"k8s.io/api/batch/v1beta1"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

//CreateCleanerCronJob that will clean up all terminated pods
func CreateCleanerCronJob(clientset *kubernetes.Clientset) (*v1beta1.CronJob, error) {
	namespace := "default"
	if os.Getenv("TELUNJUK_NAMESPACE") != "" {
		namespace = os.Getenv("TELUNJUK_NAMESPACE")
	}

	name := "jobs-cleanup"
	cron, err := clientset.BatchV1beta1().CronJobs(namespace).Get(context.TODO(), name, metav1.GetOptions{})
	if err != nil && err.Error() != "cronjobs.batch \"jobs-cleanup\" not found" {
		logrus.Panic(err)
	}
	if cron.Name != "" {
		return cron, err
	}

	return clientset.BatchV1beta1().CronJobs(namespace).Create(context.TODO(), &v1beta1.CronJob{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: namespace,
		}, Spec: v1beta1.CronJobSpec{
			Schedule: "1 * * * *",

			JobTemplate: v1beta1.JobTemplateSpec{
				Spec: v1.JobSpec{
					Template: apiv1.PodTemplateSpec{
						Spec: apiv1.PodSpec{
							Containers: []apiv1.Container{
								{
									Name:            "kubectl-container",
									Image:           "bitnami/kubectl:latest",
									Command:         []string{"sh", "-c", "kubectl delete pods --field-selector status.phase=Succeeded --all-namespaces"},
									ImagePullPolicy: apiv1.PullIfNotPresent,
								},
							},
							RestartPolicy: apiv1.RestartPolicyNever,
						},
					},
				},
			},
		},
	}, metav1.CreateOptions{})
}
