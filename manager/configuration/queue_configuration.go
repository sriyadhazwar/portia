package configuration

type QueueConfiguration struct {
	SubscribeQueueName string `yaml:"SubscribeQueueName"`
	PublishQueueName   string `yaml:"PublishQueueName"`
	Durable            bool   `yaml:"Durable"`
	AutoAck            bool   `yaml:"AutoAck"`
	AutoDelete         bool   `yaml:"AutoDelete"`
	Exclusive          bool   `yaml:"Exclusive"`
	NoWait             bool   `yaml:"NoWait"`
}
