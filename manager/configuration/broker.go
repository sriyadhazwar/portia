package configuration

import (
	"fmt"
)

type Broker struct {
	Type     string                `yml:"type"`
	Host     string                `yml:"host"`
	Port     int                   `yml:"port"`
	HttpPort int                   `yml:"HttpPort"`
	User     string                `yml:"user"`
	Password string                `yml:"password"`
	Queue    QueueConfiguration    `yaml:"Queue"`
	Exchange ExchangeConfiguration `yaml:"Exchange"`
}

func (d *Broker) AsRabbitMQ() string {
	return fmt.Sprintf("amqp://%s:%s@%s:%d", d.User, d.Password, d.Host, d.Port)
}

func (d *Broker) AsKafka() string {
	return fmt.Sprintf("amqp://%s:%s@%s:%d", d.User, d.Password, d.Host, d.Port)
}
