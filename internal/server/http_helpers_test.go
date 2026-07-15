package server

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestSocketURLUsesMatchingScheme(t *testing.T) {
	tests := []struct {
		name string
		base string
		want string
	}{
		{name: "https", base: "https://monitor.example.com/base/", want: "wss://monitor.example.com/base/ws"},
		{name: "http", base: "http://localhost:3000/", want: "ws://localhost:3000/ws"},
		{name: "host only", base: "monitor.example.com", want: "ws://monitor.example.com/ws"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := socketURL(tt.base); got != tt.want {
				t.Fatalf("socketURL(%q) = %q, want %q", tt.base, got, tt.want)
			}
		})
	}
}

func TestWriteJSONSetsContentTypeAndEncodesBody(t *testing.T) {
	resp := httptest.NewRecorder()
	writeJSON(resp, map[string]string{"ok": "true"})

	if got := resp.Header().Get("Content-Type"); got != "application/json" {
		t.Fatalf("content type = %q", got)
	}
	var body map[string]string
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if body["ok"] != "true" {
		t.Fatalf("body = %#v", body)
	}
}

func TestMethodNotAllowedWritesStatus(t *testing.T) {
	resp := httptest.NewRecorder()
	methodNotAllowed(resp)

	if resp.Code != http.StatusMethodNotAllowed {
		t.Fatalf("status = %d, want %d", resp.Code, http.StatusMethodNotAllowed)
	}
}

func TestShouldGzipStaticExtensions(t *testing.T) {
	tests := []struct {
		path string
		want bool
	}{
		{path: "index.html", want: true},
		{path: "assets/app.css", want: true},
		{path: "assets/app.js", want: true},
		{path: "config.json", want: true},
		{path: "logo.svg", want: true},
		{path: "font.woff2", want: false},
		{path: "image.png", want: false},
	}

	for _, tt := range tests {
		t.Run(tt.path, func(t *testing.T) {
			if got := shouldGzip(tt.path); got != tt.want {
				t.Fatalf("shouldGzip(%q) = %v, want %v", tt.path, got, tt.want)
			}
		})
	}
}

func TestSetStaticCacheHeaders(t *testing.T) {
	indexResp := httptest.NewRecorder()
	setStaticCache(indexResp, "index.html")
	if got := indexResp.Header().Get("Cache-Control"); got != "no-cache" {
		t.Fatalf("index cache = %q", got)
	}

	assetResp := httptest.NewRecorder()
	setStaticCache(assetResp, "assets/app.js")
	if got := assetResp.Header().Get("Cache-Control"); got != "public, max-age=31536000, immutable" {
		t.Fatalf("asset cache = %q", got)
	}
}
