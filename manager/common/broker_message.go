package common

//BrokerMessage standard struct
type BrokerMessage struct {
	Header  MessageHeader  `json:"header"`
	Payload MessagePayload `json:"payload"`
}

//MessageHeader standard struct
type MessageHeader struct {
	MessageType   int    `json:"message_type"`   // individual message need to have message type so we can choose where to dispatch handler
	CorrelationID string `json:"correlation_id"` // this will be filled when the message is a reply to a request
	ReturnAddress string `json:"return_address"` // this will be filled when the message is a reply to a request
	MessageID     string `json:"message_id"`     // this will be UUID that's unique for each message
	MessageFlag   int    `json:"message_flag"`   // this will be a bitwise numbering
}

//MessagePayload standard struct
type MessagePayload struct {
	Action  string      `json:"action"`  // individual message need to have message type so we can choose where to dispatch handler
	Headers interface{} `json:"headers"` // this will be filled when the message is a reply to a request
	Params  interface{} `json:"params"`  // this will be filled when handler need a parametert
	Query   interface{} `json:"query"`   // this will be UUID that's unique for each message
	Body    interface{} `json:"body"`    // this will be a string in JSON format
	Service string      `json:"service"` // this will be a string in JSON format
}
