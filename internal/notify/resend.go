package notify

import (
	"bytes"
	"encoding/json"
	"net/http"
	"time"
)

type resendPayload struct {
	From    string `json:"from"`
	To      string `json:"to"`
	Subject string `json:"subject"`
	Text    string `json:"text"`
}

func SendResend(apiKey, subject, to, text string) {
	if apiKey == "" || to == "" {
		return
	}
	body, _ := json.Marshal(resendPayload{
		From:    "Monitor <no-reply@monitor.local>",
		To:      to,
		Subject: subject,
		Text:    text,
	})
	req, _ := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{Timeout: 10 * time.Second}
	_, _ = client.Do(req)
}

