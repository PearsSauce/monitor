package api

import (
	"encoding/json"
	"net/http"
)

// APIError represents a structured error response
type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details any    `json:"details,omitempty"`
}

// Common error codes
const (
	ErrCodeBadRequest     = "BAD_REQUEST"
	ErrCodeUnauthorized   = "UNAUTHORIZED"
	ErrCodeForbidden      = "FORBIDDEN"
	ErrCodeNotFound       = "NOT_FOUND"
	ErrCodeMethodNotAllow = "METHOD_NOT_ALLOWED"
	ErrCodeConflict       = "CONFLICT"
	ErrCodeInternal       = "INTERNAL_ERROR"
	ErrCodeValidation     = "VALIDATION_ERROR"
	ErrCodeDatabase       = "DATABASE_ERROR"
	ErrCodeSMTP           = "SMTP_ERROR"
)

// writeError writes a structured JSON error response
func writeError(w http.ResponseWriter, status int, code, message string, details any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(APIError{
		Code:    code,
		Message: message,
		Details: details,
	})
}

// Error response helpers
func badRequest(w http.ResponseWriter, message string) {
	writeError(w, http.StatusBadRequest, ErrCodeBadRequest, message, nil)
}

func unauthorized(w http.ResponseWriter) {
	writeError(w, http.StatusUnauthorized, ErrCodeUnauthorized, "认证失败", nil)
}

func forbidden(w http.ResponseWriter) {
	writeError(w, http.StatusForbidden, ErrCodeForbidden, "无权限访问", nil)
}

func notFound(w http.ResponseWriter, message string) {
	writeError(w, http.StatusNotFound, ErrCodeNotFound, message, nil)
}

func methodNotAllowed(w http.ResponseWriter) {
	writeError(w, http.StatusMethodNotAllowed, ErrCodeMethodNotAllow, "方法不允许", nil)
}

func internalError(w http.ResponseWriter, message string) {
	writeError(w, http.StatusInternalServerError, ErrCodeInternal, message, nil)
}

func validationError(w http.ResponseWriter, message string, details any) {
	writeError(w, http.StatusBadRequest, ErrCodeValidation, message, details)
}

func databaseError(w http.ResponseWriter, err error) {
	writeError(w, http.StatusInternalServerError, ErrCodeDatabase, "数据库操作失败", err.Error())
}

func smtpError(w http.ResponseWriter, message string) {
	writeError(w, http.StatusBadRequest, ErrCodeSMTP, message, nil)
}
