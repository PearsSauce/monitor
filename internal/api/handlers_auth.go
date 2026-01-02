package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// LoginRequest represents login credentials
type LoginRequest struct {
	Password string `json:"password"`
}

// LoginResponse represents successful login response
type LoginResponse struct {
	Token     string `json:"token"`
	ExpiresAt string `json:"expires_at"`
}

// handleLogin handles POST /api/login
func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		methodNotAllowed(w)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		badRequest(w, "无效的JSON格式")
		return
	}

	if s.cfg.AdminPassword == "" || req.Password != s.cfg.AdminPassword {
		unauthorized(w)
		return
	}

	expiresAt := time.Now().Add(24 * time.Hour)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"admin": true,
		"exp":   expiresAt.Unix(),
	})

	ts, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		s.logger.Error("JWT签名失败", "error", err)
		internalError(w, "生成令牌失败")
		return
	}

	writeJSON(w, LoginResponse{
		Token:     ts,
		ExpiresAt: expiresAt.Format(time.RFC3339),
	})
}

// handleAdminVerify handles GET /api/admin/verify
func (s *Server) handleAdminVerify(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}

	if !s.requireAuth(r) {
		unauthorized(w)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
