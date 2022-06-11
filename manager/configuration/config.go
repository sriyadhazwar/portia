package configuration

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/sirupsen/logrus"

	"github.com/gin-contrib/cors"

	"github.com/spf13/viper"
)

//Config : struct for configuration object
type Config struct {
	Database   Database    `yml:"database"`
	Broker     Broker      `yml:"broker"`
	Cors       cors.Config `yaml:"cors"`
	Port       string      `yml:"port"`
	Mode       string      `yml:"mode"`
	DebugLevel string      `yml:"debug_level"`
	Extractor  int         `yml:"extractor"`
	Fetcher    int         `yml:"fetcher"`
	Feeder     int         `yml:"feeder"`
}

func getEnvOrPanic(env string) string {
	res := os.Getenv(env)
	if len(env) == 0 {
		panic("Mandatory env variable not found:" + env)
	}
	return res
}

//NewConfiguration ; instantiate new Configuration
func NewConfiguration(path string, configName string) (*Config, error) {
	name := "default"
	if configName != "" {
		name = configName
	}

	viper.AddConfigPath(path)
	viper.SetConfigName(name)
	viper.AutomaticEnv()
	err := viper.ReadInConfig()

	logrus.Print("Getting environment variables...")
	for _, k := range viper.AllKeys() {
		value := viper.GetString(k)
		if strings.HasPrefix(value, "${") && strings.HasSuffix(value, "}") {
			viper.Set(k, getEnvOrPanic(strings.TrimSuffix(strings.TrimPrefix(value, "${"), "}")))
		}
	}

	conf := &Config{}

	if err != nil {
		fmt.Printf("error %s", err)
		return conf, errors.New("error when read config, please see error log")
	}

	err = viper.Unmarshal(conf)
	if err != nil {
		fmt.Printf("unable to decode into config struct, %v", err)
		return conf, err

	}

	// Watch config file changes
	viper.WatchConfig()

	return conf, err
}
