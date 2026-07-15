package server

import (
	"crypto/sha1"
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"strings"
)

func upgradeWebSocket(w http.ResponseWriter, r *http.Request) (net.Conn, *bufioWriter, error) {
	if !strings.EqualFold(r.Header.Get("Upgrade"), "websocket") {
		return nil, nil, errors.New("not websocket")
	}
	if !headerHasToken(r.Header.Get("Connection"), "upgrade") {
		return nil, nil, errors.New("missing websocket connection upgrade")
	}
	if strings.TrimSpace(r.Header.Get("Sec-WebSocket-Version")) != "13" {
		return nil, nil, errors.New("unsupported websocket version")
	}
	key := strings.TrimSpace(r.Header.Get("Sec-WebSocket-Key"))
	if key == "" {
		return nil, nil, errors.New("missing websocket key")
	}
	if !validWebSocketKey(key) {
		return nil, nil, errors.New("invalid websocket key")
	}
	h, ok := w.(http.Hijacker)
	if !ok {
		return nil, nil, errors.New("hijacking unsupported")
	}
	conn, rw, err := h.Hijack()
	if err != nil {
		return nil, nil, err
	}
	accept := websocketAccept(key)
	_, err = fmt.Fprintf(rw, "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: %s\r\n\r\n", accept)
	if err != nil {
		conn.Close()
		return nil, nil, err
	}
	if err := rw.Flush(); err != nil {
		conn.Close()
		return nil, nil, err
	}
	return conn, &bufioWriter{conn: conn}, nil
}

type bufioWriter struct{ conn net.Conn }

func (w *bufioWriter) Write(p []byte) (int, error) { return w.conn.Write(p) }

func headerHasToken(header, token string) bool {
	for _, part := range strings.Split(header, ",") {
		if strings.EqualFold(strings.TrimSpace(part), token) {
			return true
		}
	}
	return false
}

func validWebSocketKey(key string) bool {
	decoded, err := base64.StdEncoding.DecodeString(key)
	return err == nil && len(decoded) == 16
}

func websocketAccept(key string) string {
	h := sha1.Sum([]byte(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"))
	return base64.StdEncoding.EncodeToString(h[:])
}

func readWS(conn net.Conn) ([]byte, error) {
	header := make([]byte, 2)
	if _, err := io.ReadFull(conn, header); err != nil {
		return nil, err
	}
	masked := header[1]&0x80 != 0
	if !masked {
		return nil, errors.New("websocket client frame not masked")
	}
	if header[0]&0x70 != 0 {
		return nil, errors.New("websocket reserved bits set")
	}
	fin := header[0]&0x80 != 0
	opcode := header[0] & 0x0f
	switch opcode {
	case 1:
		if !fin {
			return nil, errors.New("websocket fragmented frames unsupported")
		}
	case 8:
		return nil, io.EOF
	default:
		return nil, errors.New("websocket unsupported opcode")
	}
	length := uint64(header[1] & 0x7f)
	if length == 126 {
		buf := make([]byte, 2)
		if _, err := io.ReadFull(conn, buf); err != nil {
			return nil, err
		}
		length = uint64(binary.BigEndian.Uint16(buf))
	} else if length == 127 {
		buf := make([]byte, 8)
		if _, err := io.ReadFull(conn, buf); err != nil {
			return nil, err
		}
		length = binary.BigEndian.Uint64(buf)
	}
	if length > 1<<20 {
		return nil, errors.New("websocket frame too large")
	}
	mask := make([]byte, 4)
	if masked {
		if _, err := io.ReadFull(conn, mask); err != nil {
			return nil, err
		}
	}
	payload := make([]byte, length)
	if _, err := io.ReadFull(conn, payload); err != nil {
		return nil, err
	}
	if masked {
		for i := range payload {
			payload[i] ^= mask[i%4]
		}
	}
	return payload, nil
}

func writeWS(w io.Writer, value any) error {
	payload, err := json.Marshal(value)
	if err != nil {
		return err
	}
	header := []byte{0x81}
	if len(payload) < 126 {
		header = append(header, byte(len(payload)))
	} else if len(payload) <= 65535 {
		header = append(header, 126, byte(len(payload)>>8), byte(len(payload)))
	} else {
		header = append(header, 127)
		var buf [8]byte
		binary.BigEndian.PutUint64(buf[:], uint64(len(payload)))
		header = append(header, buf[:]...)
	}
	if _, err := w.Write(header); err != nil {
		return err
	}
	_, err = w.Write(payload)
	return err
}

func writeWSBytes(w io.Writer, payload []byte) error {
	header := []byte{0x81}
	if len(payload) < 126 {
		header = append(header, byte(len(payload)))
	} else if len(payload) <= 65535 {
		header = append(header, 126, byte(len(payload)>>8), byte(len(payload)))
	} else {
		header = append(header, 127)
		var buf [8]byte
		binary.BigEndian.PutUint64(buf[:], uint64(len(payload)))
		header = append(header, buf[:]...)
	}
	if _, err := w.Write(header); err != nil {
		return err
	}
	_, err := w.Write(payload)
	return err
}
