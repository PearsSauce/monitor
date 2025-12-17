package notify

import (
	"bytes"
	"crypto/rand"
	"crypto/tls"
	"fmt"
	"mime"
	"mime/quotedprintable"
	"net"
	"net/smtp"
	"strings"
	"time"
)

func SendSMTP(server string, port int, user, password, from, to, subject, text string) error {
	if server == "" || port <= 0 || user == "" || password == "" || from == "" || to == "" {
		return nil
	}
	addr := fmt.Sprintf("%s:%d", server, port)
	auth := smtp.PlainAuth("", user, password, server)
	fromAddr := extractEmail(from)
	toAddr := strings.TrimSpace(to)
	subj := mime.QEncoding.Encode("UTF-8", subject)
	date := time.Now().UTC().Format(time.RFC1123Z)
	msgID := "<" + newMsgID() + "@" + domainOf(fromAddr) + ">"
	var body bytes.Buffer
	qp := quotedprintable.NewWriter(&body)
	_, _ = qp.Write([]byte(text))
	_ = qp.Close()
	msg := []byte("From: " + fromAddr + "\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subj + "\r\n" +
		"Date: " + date + "\r\n" +
		"Message-ID: " + msgID + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=UTF-8\r\n" +
		"Content-Transfer-Encoding: quoted-printable\r\n" +
		"\r\n" + body.String())
	var c *smtp.Client
	if port == 465 {
		conn, err := tls.Dial("tcp", addr, &tls.Config{ServerName: server})
		if err != nil {
			return fmt.Errorf("dial tls: %w", err)
		}
		client, err := smtp.NewClient(conn, server)
		if err != nil {
			return fmt.Errorf("client: %w", err)
		}
		c = client
	} else {
		conn, err := net.Dial("tcp", addr)
		if err != nil {
			return fmt.Errorf("dial: %w", err)
		}
		client, err := smtp.NewClient(conn, server)
		if err != nil {
			return fmt.Errorf("client: %w", err)
		}
		c = client
		if ok, _ := c.Extension("STARTTLS"); ok {
			if err := c.StartTLS(&tls.Config{ServerName: server}); err != nil {
				return fmt.Errorf("starttls: %w", err)
			}
		}
	}
	if ok, _ := c.Extension("AUTH"); ok {
		if err := c.Auth(auth); err != nil {
			_ = c.Quit()
			return fmt.Errorf("auth: %w", err)
		}
	}
	if err := c.Mail(fromAddr); err != nil {
		_ = c.Quit()
		return fmt.Errorf("mail from: %w", err)
	}
	if err := c.Rcpt(toAddr); err != nil {
		_ = c.Quit()
		return fmt.Errorf("rcpt to: %w", err)
	}
	w, err := c.Data()
	if err != nil {
		_ = c.Quit()
		return fmt.Errorf("data: %w", err)
	}
	if _, err := w.Write(msg); err != nil {
		_ = w.Close()
		_ = c.Quit()
		return fmt.Errorf("write: %w", err)
	}
	if err := w.Close(); err != nil {
		_ = c.Quit()
		return fmt.Errorf("close: %w", err)
	}
	if err := c.Quit(); err != nil {
		return fmt.Errorf("quit: %w", err)
	}
	return nil
}

func extractEmail(s string) string {
	s = strings.TrimSpace(s)
	if i := strings.Index(s, "<"); i >= 0 {
		if j := strings.Index(s, ">"); j > i {
			return strings.TrimSpace(s[i+1 : j])
		}
	}
	return s
}

func domainOf(email string) string {
	if i := strings.LastIndex(email, "@"); i >= 0 && i+1 < len(email) {
		return strings.TrimSpace(email[i+1:])
	}
	return "localhost"
}

func newMsgID() string {
	var b [16]byte
	_, _ = rand.Read(b[:])
	return fmt.Sprintf("%x", b[:])
}
