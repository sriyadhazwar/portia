package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Config struct {
	Id        primitive.ObjectID `bson:"_id"`
	Feeder    int32              `bson:"feeder"`
	Fetcher   int32              `bson:"fetcher"`
	Extractor int32              `bson:"extractor"`
	CreatedAt primitive.DateTime `bson:"created_at"`
	UpdatedAt primitive.DateTime `bson:"updated_at"`
}
