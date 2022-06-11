package common

import (
	"context"
	"net/http"
)

type IHandler interface {
	GetHandlers() map[string]func(context.Context, BrokerMessage) (*HandlerResponse, error)
}

type HandlerResponse struct {
	StatusCode int         `json:"statusCode"`
	Payload    interface{} `json:"payload"`
}

// OK set current request context to return http status ok
func OK() *HandlerResponse {
	return &HandlerResponse{StatusCode: http.StatusOK}
}

// OKWithData set current request context to return http status ok with json data
func OKWithData(data interface{}) *HandlerResponse {
	return &HandlerResponse{StatusCode: http.StatusOK, Payload: data}
}

// Created set current request context to return http status created
func Created() *HandlerResponse {
	return &HandlerResponse{StatusCode: http.StatusCreated}
}

// CreatedWithData set current request context to return http status created with json data
func CreatedWithData(data interface{}) *HandlerResponse {
	return &HandlerResponse{StatusCode: http.StatusCreated, Payload: data}
}

// BadRequest abort current request context with http status bad request
func BadRequest() *HandlerResponse {
	return &HandlerResponse{StatusCode: http.StatusBadRequest}
}

// BadRequestWithData abort current request context with http status bad request and error message
func BadRequestWithData(data interface{}) *HandlerResponse {
	return &HandlerResponse{StatusCode: http.StatusBadRequest, Payload: data}
}

// NotFound abort current request context with http status not found
func NotFound() *HandlerResponse {
	return &HandlerResponse{StatusCode: http.StatusNotFound}
}

// NotFoundWithData abort current request context with http status not found and error message
func NotFoundWithData(data interface{}) *HandlerResponse {
	return &HandlerResponse{StatusCode: http.StatusNotFound, Payload: data}
}

// Unauthorized abort current request context with http status unauthorized
func Unauthorized() *HandlerResponse {
	return &HandlerResponse{StatusCode: http.StatusUnauthorized}
}

// UnauthorizedWithData abort current request context with http status unauthorized and error message
func UnauthorizedWithData(data interface{}) *HandlerResponse {
	return &HandlerResponse{StatusCode: http.StatusUnauthorized, Payload: data}
}

// InternalServerError abort current request context with http status internal server error
func InternalServerError() *HandlerResponse {
	return &HandlerResponse{StatusCode: http.StatusInternalServerError}
}

// InternalServerErrorWithData abort current request context with http status internal server error and a message
func InternalServerErrorWithData(data interface{}) *HandlerResponse {
	return &HandlerResponse{StatusCode: http.StatusInternalServerError, Payload: data}
}
