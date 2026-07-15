package server

import (
	"crypto/rand"
	"encoding/base64"
	"sync"
	"time"
)

type SessionStore struct {
	mu       sync.Mutex
	sessions map[string]time.Time
}

func NewSessionStore() *SessionStore {
	return &SessionStore{sessions: map[string]time.Time{}}
}

func (s *SessionStore) Create() (string, error) {
	var buf [32]byte
	if _, err := rand.Read(buf[:]); err != nil {
		return "", err
	}
	token := base64.RawURLEncoding.EncodeToString(buf[:])
	s.mu.Lock()
	defer s.mu.Unlock()
	s.sessions[token] = time.Now().Add(24 * time.Hour)
	return token, nil
}

func (s *SessionStore) Valid(token string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	expires, ok := s.sessions[token]
	if !ok {
		return false
	}
	if time.Now().After(expires) {
		delete(s.sessions, token)
		return false
	}
	return true
}

func (s *SessionStore) Delete(token string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.sessions, token)
}
