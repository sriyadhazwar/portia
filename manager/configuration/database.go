package configuration

import "fmt"

//Database struct
type Database struct {
	Host     string `yml:"host"`
	User     string `yml:"user"`
	Password string `yml:"password"`
	DbName   string `yml:"dbname"`
	Port     int    `yml:"port"`
	SSL      string `yml:"ssl"`
}

func (d *Database) AsPostgres() string {
	return fmt.Sprintf("postgresql://%s:%s@%s:%d/%s?sslmode=%s", d.User, d.Password, d.Host, d.Port, d.DbName, d.SSL)
}

func (d *Database) AsPostgresDefaultDB() string {
	return fmt.Sprintf("postgresql://%s:%s@%s:%d/%s?sslmode=%s", d.User, d.Password, d.Host, d.Port, "postgres", d.SSL)
}

func (d *Database) AsMysql() string {
	return fmt.Sprintf("%s:%s@(%s:%d)/%s?charset=utf8&parseTime=True&loc=Local", d.User, d.Password, d.Host, d.Port, d.DbName)
}

func (d *Database) AsMysqlDefaultDB() string {
	return fmt.Sprintf("%s:%s@(%s:%d)/%s?charset=utf8&parseTime=True&loc=Local", d.User, d.Password, d.Host, d.Port, "sys")
}
