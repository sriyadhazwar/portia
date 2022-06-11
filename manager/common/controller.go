package common

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

//HttpOK set current request context to return http status ok
func HttpOK(context *gin.Context) {
	context.JSON(http.StatusOK, NewResponse())
}

//HttpOKWithData set current request context to return http status ok with json data
func HttpOKWithData(context *gin.Context, data interface{}) {
	context.JSON(http.StatusOK, NewResponseWithData(data))
}

//HttpCreated set current request context to return http status created
func HttpCreated(context *gin.Context) {
	context.JSON(http.StatusCreated, NewResponse())
}

//HttpCreatedWithData set current request context to return http status created with json data
func HttpCreatedWithData(context *gin.Context, data interface{}) {
	context.JSON(http.StatusCreated, NewResponseWithData(data))
}

//HttpBadRequest abort current request context with http status bad request
func HttpBadRequest(context *gin.Context) {
	context.AbortWithStatusJSON(http.StatusBadRequest, NewResponseWithErrorMessage("Invalid request"))
}

//HttpBadRequestWithMessage abort current request context with http status bad request and error message
func HttpBadRequestWithMessage(context *gin.Context, message string) {
	context.AbortWithStatusJSON(http.StatusBadRequest, NewResponseWithErrorMessage(message))
}

//HttpBadRequestWithMessages abort current request context with http status bad request and error messages
func HttpBadRequestWithMessages(context *gin.Context, messages []string) {
	context.AbortWithStatusJSON(http.StatusBadRequest, NewResponseWithErrorMessages(messages))
}

//HttpInternalServerError abort current request context with http status internal server error
func HttpInternalServerError(context *gin.Context) {
	context.AbortWithStatus(http.StatusInternalServerError)
}

//HttpInternalServerErrorWithMessage abort current request context with http status internal server error and a message
func HttpInternalServerErrorWithMessage(context *gin.Context, message string) {
	context.AbortWithStatusJSON(http.StatusInternalServerError, NewResponseWithErrorMessage(message))
}
