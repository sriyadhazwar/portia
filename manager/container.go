package main

import (
	"fmt"
	"gitlab.com/labtek/telunjuk/manager/domain/scheduler"
	"gitlab.com/labtek/telunjuk/manager/infrastructure/transport/message_broker/handlers"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mattn/go-colorable"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"gitlab.com/labtek/telunjuk/manager/configuration"
	"gitlab.com/labtek/telunjuk/manager/domain/metrics"
	"gitlab.com/labtek/telunjuk/manager/infrastructure/transport/message_broker"
	"gitlab.com/labtek/telunjuk/manager/infrastructure/transport/rest"
)

var (
	done chan bool
)

//Container as application container
type Container struct {
	router        *rest.Router
	messageBroker *message_broker.Broker
	config        *configuration.Config
	server        *http.Server
	kubeService   *metrics.Service
	cron          *scheduler.CronJob
}

//Init all dependency
func (c *Container) Init() {
	env := "debug"
	kube := "./configuration/config"
	path := "./configuration"
	hostEnv := os.Getenv("ENV")
	configPath := os.Getenv("CONFIG_PATH")
	kubeConfig := os.Getenv("KUBE_CONFIG_PATH")

	cron := scheduler.NewCronJob()
	if hostEnv != "" {
		env = hostEnv
	}

	if configPath != "" {
		path = configPath
	}

	if kubeConfig != "" {
		kube = kubeConfig
	}

	cfg, err := configuration.NewConfiguration(path, env)
	c.kubeService = metrics.NewService(env == "debug", kube, cfg)
	if err != nil {
		panic(err)
	}
	c.config = cfg
	c.cron = cron
}

//WebStart starting a web server
func (c *Container) WebStart() {
	c.router = rest.NewRouter(c.config, c.kubeService)
	gin.DefaultWriter = colorable.NewColorableStderr()
	port := c.config.Port
	c.server = &http.Server{
		Addr:    fmt.Sprintf(":%s", port),
		Handler: c.router.SetupRouter(gin.Default()),
	}

	logrus.Infof("Server run on port: %s", port)

	errListen := c.server.ListenAndServe()

	if errListen != http.ErrServerClosed {
		logrus.Fatalf("Failed to start server: %+v", errors.WithStack(errListen))
		panic(fmt.Errorf("fatal error failed to start server : %+v", errors.WithStack(errListen)))
	}
}

//MessageBrokerStart start broker
func (c *Container) MessageBrokerStart() {
	metricHandler := handlers.NewMetricHandler(c.kubeService)
	handlers_instance := message_broker.NewHandler(metricHandler)

	c.messageBroker = message_broker.NewBroker(c.config)
	c.messageBroker.RegisterHandlers(handlers_instance)

	if err := c.messageBroker.Init(); err != nil {
		panic(err)
	}

	messages := c.messageBroker.Consume()
	c.messageBroker.Worker(messages, done)
}

//CronJobStart schedule autoscale
func (c *Container) CronJobStart() {
	c.cron.CreateJob(c.kubeService.Autoscale)
	c.cron.Start()
}

//Start the application container
func (c *Container) Start() {
	done = make(chan bool)

	//go func() {
	//	c.MessageBrokerStart()
	//}()

	go func() {
		c.WebStart()
	}()

	go func() {
		//Direct call -- For debug only
		// c.kubeService.Autoscale()

		c.CronJobStart()
	}()

	// Wait for interrupt signal to gracefully shutdown the server with
	// a timeout of 10 seconds.
	exit := make(chan os.Signal, 1)
	signal.Notify(exit, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)
	<-exit
	ticker := time.NewTimer(10 * time.Second)

	go func() {
		<-ticker.C
		ticker.Stop()
		done <- true
	}()

	c.cron.Stop()
	//	c.messageBroker.Shutdown(exit, done)
	c.router.Shutdown(c.server)
}
