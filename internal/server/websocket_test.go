package server

import (
	"bytes"
	"errors"
	"io"
	"net"
	"strings"
	"testing"
	"time"
)

func TestValidWebSocketKey(t *testing.T) {
	tests := []struct {
		name string
		key  string
		want bool
	}{
		{name: "rfc example", key: "dGhlIHNhbXBsZSBub25jZQ==", want: true},
		{name: "empty", key: "", want: false},
		{name: "not base64", key: "not-a-valid-key", want: false},
		{name: "too short", key: "c2hvcnQ=", want: false},
		{name: "too long", key: "dGhlIHNhbXBsZSBub25jZTEyMzQ=", want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := validWebSocketKey(tt.key); got != tt.want {
				t.Fatalf("validWebSocketKey(%q) = %v, want %v", tt.key, got, tt.want)
			}
		})
	}
}

func TestWebSocketAcceptMatchesRFCExample(t *testing.T) {
	const key = "dGhlIHNhbXBsZSBub25jZQ=="
	const want = "s3pPLMBiTxaQ9kYGzzhZRbK+xOo="
	if got := websocketAccept(key); got != want {
		t.Fatalf("websocketAccept(%q) = %q, want %q", key, got, want)
	}
}

func TestHeaderHasTokenHonorsCommaSeparatedValues(t *testing.T) {
	tests := []struct {
		name   string
		header string
		token  string
		want   bool
	}{
		{name: "single token", header: "Upgrade", token: "upgrade", want: true},
		{name: "comma separated", header: "keep-alive, Upgrade", token: "upgrade", want: true},
		{name: "case insensitive", header: "KEEP-ALIVE, upgrade", token: "Upgrade", want: true},
		{name: "missing", header: "keep-alive", token: "upgrade", want: false},
		{name: "substring rejected", header: "x-upgrade", token: "upgrade", want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := headerHasToken(tt.header, tt.token); got != tt.want {
				t.Fatalf("headerHasToken(%q, %q) = %v, want %v", tt.header, tt.token, got, tt.want)
			}
		})
	}
}

func TestReadWSRequiresMaskedClientFrames(t *testing.T) {
	maskedFrame := maskedWSFrame(0x81, "ok")
	payload, err := readWS(&bufferConn{Reader: bytes.NewReader(maskedFrame)})
	if err != nil {
		t.Fatal(err)
	}
	if string(payload) != "ok" {
		t.Fatalf("masked frame payload = %q", string(payload))
	}

	_, err = readWS(&bufferConn{Reader: bytes.NewReader([]byte{0x81, 0x02, 'o', 'k'})})
	if err == nil || !strings.Contains(err.Error(), "not masked") {
		t.Fatalf("unmasked frame error = %v", err)
	}
}

func TestReadWSRejectsUnsupportedClientFrames(t *testing.T) {
	tests := []struct {
		name    string
		frame   []byte
		wantErr string
	}{
		{
			name:    "binary opcode",
			frame:   maskedWSFrame(0x82, "ok"),
			wantErr: "unsupported opcode",
		},
		{
			name:    "fragmented text",
			frame:   maskedWSFrame(0x01, "ok"),
			wantErr: "fragmented",
		},
		{
			name:    "reserved bit",
			frame:   maskedWSFrame(0xc1, "ok"),
			wantErr: "reserved bits",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := readWS(&bufferConn{Reader: bytes.NewReader(tt.frame)})
			if err == nil || !strings.Contains(err.Error(), tt.wantErr) {
				t.Fatalf("readWS error = %v, want %q", err, tt.wantErr)
			}
		})
	}
}

func TestReadWSCloseFrameReturnsEOF(t *testing.T) {
	_, err := readWS(&bufferConn{Reader: bytes.NewReader(maskedWSFrame(0x88, ""))})
	if !errors.Is(err, io.EOF) {
		t.Fatalf("close frame error = %v", err)
	}
}

func TestWriteWSBytesWritesTextFrame(t *testing.T) {
	var out bytes.Buffer
	if err := writeWSBytes(&out, []byte("ok")); err != nil {
		t.Fatal(err)
	}
	want := []byte{0x81, 0x02, 'o', 'k'}
	if !bytes.Equal(out.Bytes(), want) {
		t.Fatalf("writeWSBytes frame = %#v, want %#v", out.Bytes(), want)
	}
}

type bufferConn struct {
	*bytes.Reader
}

func (c *bufferConn) Write(p []byte) (int, error)      { return len(p), nil }
func (c *bufferConn) Close() error                     { return nil }
func (c *bufferConn) LocalAddr() net.Addr              { return testAddr("local") }
func (c *bufferConn) RemoteAddr() net.Addr             { return testAddr("remote") }
func (c *bufferConn) SetDeadline(time.Time) error      { return nil }
func (c *bufferConn) SetReadDeadline(time.Time) error  { return nil }
func (c *bufferConn) SetWriteDeadline(time.Time) error { return nil }

func maskedWSFrame(firstByte byte, payload string) []byte {
	mask := []byte{0x01, 0x02, 0x03, 0x04}
	frame := []byte{firstByte, 0x80 | byte(len(payload))}
	frame = append(frame, mask...)
	for i, b := range []byte(payload) {
		frame = append(frame, b^mask[i%len(mask)])
	}
	return frame
}

type testAddr string

func (a testAddr) Network() string { return string(a) }
func (a testAddr) String() string  { return string(a) }
