package configuration

type ExchangeConfiguration struct {
	Name         string `yaml:"Name"`
	ExchangeType string `yaml:"ExchangeType"`
	Durable      bool   `yaml:"Durable"`
	AutoAck      bool   `yaml:"AutoAck"`
	AutoDelete   bool   `yaml:"AutoDelete"`
	Exclusive    bool   `yaml:"Exclusive"`
	NoWait       bool   `yaml:"NoWait"`
}
