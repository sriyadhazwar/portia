package message

type RetrieveMessage struct {
	Worker  string  `json:"worker"`
	Message float64 `json:"message"`
	Count   int     `json:"count"`
}
