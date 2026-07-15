package server

import (
	"sync"
	"testing"
	"time"
)

func TestSessionStoreCreateValidAndDelete(t *testing.T) {
	store := NewSessionStore()

	token, err := store.Create()
	if err != nil {
		t.Fatal(err)
	}
	if token == "" {
		t.Fatal("created session token is empty")
	}
	if !store.Valid(token) {
		t.Fatal("created session should be valid")
	}

	store.Delete(token)
	if store.Valid(token) {
		t.Fatal("deleted session should be invalid")
	}
}

func TestSessionStoreValidExpiresAndRemovesSession(t *testing.T) {
	store := NewSessionStore()
	store.sessions["expired"] = time.Now().Add(-time.Second)

	if store.Valid("expired") {
		t.Fatal("expired session should be invalid")
	}
	if _, ok := store.sessions["expired"]; ok {
		t.Fatal("expired session should be removed")
	}
}

func TestSessionStoreConcurrentCreateAndValidate(t *testing.T) {
	store := NewSessionStore()
	var wg sync.WaitGroup
	errs := make(chan error, 32)

	for i := 0; i < 32; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			token, err := store.Create()
			if err != nil {
				errs <- err
				return
			}
			if !store.Valid(token) {
				errs <- errSessionInvalid{}
			}
		}()
	}

	wg.Wait()
	close(errs)
	for err := range errs {
		t.Fatal(err)
	}
}

type errSessionInvalid struct{}

func (errSessionInvalid) Error() string { return "created session was invalid" }
