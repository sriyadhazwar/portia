package common

import (
	"fmt"
	"github.com/sirupsen/logrus"
)

// ErrorCode type
type ErrorCode int

// Error type enum
const (
	ErrorValidation ErrorCode = iota + 1
	ErrorInternal
	ErrorExternal
	Success
)

// ServiceResponse model
type ServiceResponse struct {
	code    ErrorCode
	message string
	inner   error
	Data    interface{}
}

func (se ServiceResponse) ErrorInstance() error {
	return se.inner
}

func (se ServiceResponse) Error() string {
	msg := se.message
	if se.inner != nil {
		msg = fmt.Sprintf("%s: %s", msg, se.inner.Error())
	}

	return msg
}

// ErrorCode return error code
func (se ServiceResponse) ErrorCode() ErrorCode {
	return se.code
}

func NewSuccess(data interface{}) *ServiceResponse {
	return &ServiceResponse{
		code:  Success,
		inner: nil,
		Data:  data,
	}
}

// NewValidationError create new error caused by validation error
func NewValidationError(message string) *ServiceResponse {
	return &ServiceResponse{
		code:    ErrorValidation,
		message: message,
	}
}

// NewInternalError create new error caused by internal service failure
func NewInternalError(err error) *ServiceResponse {
	logrus.Error(err)
	return &ServiceResponse{
		code:    ErrorInternal,
		message: "Internal system error",
		inner:   err,
	}
}

// NewExternalError create new error caused by external service failure
func NewExternalError(err error) *ServiceResponse {
	logrus.Error(err)
	return &ServiceResponse{
		code:    ErrorExternal,
		message: "Error from upstream service",
		inner:   err,
	}
}
