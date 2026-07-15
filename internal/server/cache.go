package server

import (
	"sync"
	"time"
)

type ResponseCache struct {
	mu      sync.Mutex
	dirty   bool
	expires time.Time
	data    []byte
}

func NewResponseCache() *ResponseCache {
	return &ResponseCache{dirty: true}
}

func (c *ResponseCache) MarkDirty() {
	c.mu.Lock()
	c.dirty = true
	c.mu.Unlock()
}

func (c *ResponseCache) Get(build func() []byte) []byte {
	now := time.Now()
	c.mu.Lock()
	defer c.mu.Unlock()
	if !c.dirty && now.Before(c.expires) && c.data != nil {
		return c.data
	}
	c.data = build()
	c.expires = now.Add(time.Second)
	c.dirty = false
	return c.data
}
