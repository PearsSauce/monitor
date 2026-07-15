package server

import (
	"bytes"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func TestResponseCacheReusesValueUntilDirty(t *testing.T) {
	cache := NewResponseCache()
	builds := 0

	first := cache.Get(func() []byte {
		builds++
		return []byte("first")
	})
	second := cache.Get(func() []byte {
		builds++
		return []byte("second")
	})

	if builds != 1 {
		t.Fatalf("builds before dirty = %d, want 1", builds)
	}
	if !bytes.Equal(first, []byte("first")) || !bytes.Equal(second, []byte("first")) {
		t.Fatalf("cached values = %q/%q", first, second)
	}

	cache.MarkDirty()
	third := cache.Get(func() []byte {
		builds++
		return []byte("third")
	})

	if builds != 2 {
		t.Fatalf("builds after dirty = %d, want 2", builds)
	}
	if !bytes.Equal(third, []byte("third")) {
		t.Fatalf("value after dirty = %q", third)
	}
}

func TestResponseCacheRefreshesExpiredValue(t *testing.T) {
	cache := NewResponseCache()

	first := cache.Get(func() []byte { return []byte("first") })
	cache.expires = time.Now().Add(-time.Second)
	second := cache.Get(func() []byte { return []byte("second") })

	if !bytes.Equal(first, []byte("first")) {
		t.Fatalf("first value = %q", first)
	}
	if !bytes.Equal(second, []byte("second")) {
		t.Fatalf("expired value = %q", second)
	}
}

func TestResponseCacheConcurrentGetBuildsOnce(t *testing.T) {
	cache := NewResponseCache()
	var builds int32
	var wg sync.WaitGroup
	start := make(chan struct{})
	results := make(chan []byte, 32)

	for i := 0; i < 32; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			<-start
			results <- cache.Get(func() []byte {
				atomic.AddInt32(&builds, 1)
				return []byte("shared")
			})
		}()
	}

	close(start)
	wg.Wait()
	close(results)

	if builds != 1 {
		t.Fatalf("builds = %d, want 1", builds)
	}
	for result := range results {
		if !bytes.Equal(result, []byte("shared")) {
			t.Fatalf("cached result = %q", result)
		}
	}
}
