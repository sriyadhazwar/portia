package model

type StatDetail struct {
	Avg     float64 `json:"avg"`
	AvgRate float64 `json:"avg_rate"`
	Rate    float64 `json:"rate"`
}

type MessageStat struct {
	PublishIn  float64    `json:"publish_in"`
	DetailsIn  StatDetail `json:"publish_in_details"`
	PublishOut float64    `json:"publish_out"`
	DetailsOut StatDetail `json:"publish_out_details"`
}

type Item struct {
	Name         string      `json:"name"`
	Stats        MessageStat `json:"message_stats"`
	AutoDelete   bool        `json:"auto_delete"`
	MessageReady float64     `json:"messages_ready"`
}
type Message struct {
	Items []Item `json:"items"`
}
