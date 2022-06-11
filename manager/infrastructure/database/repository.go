package database

import (
	"context"
	"log"
	"time"

	"gitlab.com/labtek/telunjuk/manager/domain/metrics/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Repository ...
type Repository struct {
	client   *mongo.Client
	database *mongo.Database
}

// NewRepository ...
func NewRepository(url string, dbname string) *Repository {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	log.Println("connecting to mongodb")
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(url))
	if err != nil {
		log.Println("Unable to create new client", err)
		return nil
	}
	database := client.Database(dbname)
	log.Printf("connected to %s", database.Name())
	return &Repository{client: client, database: database}
}

// Get ...
func (c *Repository) Get(collectionName string) *model.Config {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	log.Println("Select database collection :", collectionName)

	collection := c.database.Collection(collectionName)

	var results []*model.Config
	findOptions := options.Find()
	findOptions.SetLimit(1)
	cur, err := collection.Find(ctx, bson.D{{}}, findOptions)
	if err != nil {
		log.Println("Unable to select database collection", err)
	}

	var elem model.Config
	defaultElem := model.Config{
		Id:        primitive.ObjectID{},
		Feeder:    1,
		Fetcher:   1,
		Extractor: 1,
		CreatedAt: 0,
		UpdatedAt: 0,
	}

	for cur.Next(context.TODO()) {

		// create a value into which the single document can be decoded
		err := cur.Decode(&elem)
		if err != nil {
			log.Fatal("Unable to decode data : ", err)
		}

		log.Println("Print config : ", elem)

		results = append(results, &elem)
	}

	log.Println("Result :", results, len(results))

	if len(results) == 0 {
		results = append(results, &defaultElem)
	}

	return results[0]
}
