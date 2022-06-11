package scheduler

import (
	"github.com/robfig/cron/v3"
	"github.com/sirupsen/logrus"
)

type CronJob struct {
	CronInstance *cron.Cron
}

func NewCronJob() *CronJob {
	c := cron.New()
	return &CronJob{CronInstance: c}
}

func (c *CronJob) CreateJob(fn func()) {
	id, err := c.CronInstance.AddFunc("@every 1m", fn)
	if err != nil {
		logrus.Error(err)
		return
	}
	logrus.Infof("Cron job created with id %v", id)
}

func (c *CronJob) Start() {
	logrus.Print("Starting Cron job")
	c.CronInstance.Start()
	for _, v := range c.CronInstance.Entries() {
		logrus.Infof("[GO] Cron job ID: %v", v.ID)
	}
}

func (c *CronJob) Stop() {
	logrus.Print("[GO] Stopping Cron job")
	ctx := c.CronInstance.Stop()
	<-ctx.Done()
	logrus.Print("[GO] Cron job stopped")

}
