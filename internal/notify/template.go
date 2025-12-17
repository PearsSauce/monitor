package notify

import (
	"strconv"
	"strings"
)

func SubjectStatusChange(event string, monitorName string, siteName string) string {
	title := map[string]string{"online": "服务恢复", "offline": "服务离线"}[strings.ToLower(event)]
	if title == "" {
		title = "状态变更"
	}
	if strings.TrimSpace(siteName) != "" {
		return title + " · " + monitorName + " ｜ " + siteName
	}
	return title + " · " + monitorName
}

func SubjectSSLExpiry(monitorName string, siteName string) string {
	if strings.TrimSpace(siteName) != "" {
		return "证书到期提醒 · " + monitorName + " ｜ " + siteName
	}
	return "证书到期提醒 · " + monitorName
}

func SubjectTest(event string, monitorName string, siteName string) string {
	title := map[string]string{"online": "测试 · 服务恢复", "offline": "测试 · 服务离线", "ssl_expiry": "测试 · 证书到期"}[strings.ToLower(event)]
	if title == "" {
		title = "测试通知"
	}
	if strings.TrimSpace(siteName) != "" {
		return title + " · " + monitorName + " ｜ " + siteName
	}
	return title + " · " + monitorName
}

func htmlShell(siteName string, headline string, badge string, content string, footer string) string {
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>` + headline + `</title>
  <style>
    body{margin:0;background:#f6f7f9;color:#161823;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;}
    .container{max-width:600px;margin:24px auto;padding:0 16px;}
    .card{background:#fff;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden}
    .header{padding:18px 20px;background:#0b5fff;color:#fff;display:flex;align-items:center;justify-content:space-between}
    .brand{font-weight:600;font-size:16px;letter-spacing:.2px}
    .headline{font-size:14px;opacity:.9}
    .content{padding:22px 20px;font-size:14px;line-height:1.7;color:#222}
    .badge{display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600}
    .badge--ok{background:#e8f4ff;color:#0b5fff}
    .badge--warn{background:#ffeeee;color:#d93025}
    .section{margin-top:10px}
    .kv{margin:6px 0}
    .kv b{display:inline-block;width:92px;color:#555}
    .footer{padding:16px 20px;border-top:1px solid #f0f2f5;color:#666;font-size:12px;background:#fafbfc}
    a{color:#0b5fff;text-decoration:none}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="brand">` + safe(siteName) + `</div>
        <div class="headline">` + safe(headline) + `</div>
      </div>
      <div class="content">
        ` + badge + `
        ` + content + `
      </div>
      <div class="footer">` + footer + `</div>
    </div>
  </div>
</body>
</html>`
}

func safe(s string) string { return strings.TrimSpace(s) }

func BodyStatusChange(siteName, monitorName, monitorURL string, event string, at string, code int, errStr string) string {
	badgeCls := "badge badge--warn"
	badgeText := "服务离线"
	desc := "站点当前出现异常，请关注。"
	if strings.ToLower(event) == "online" {
		badgeCls = "badge badge--ok"
		badgeText = "服务恢复"
		desc = "站点已恢复在线状态。"
	}
	badge := `<span class="` + badgeCls + `">` + badgeText + `</span>`
	nameBlock := link(monitorName, monitorURL)
	content := `<div class="section">` + safe(desc) + `</div>
<div class="section">
  <div class="kv"><b>站点名称</b>` + nameBlock + `</div>
  <div class="kv"><b>状态码</b>` + itoa(code) + `</div>
  <div class="kv"><b>错误信息</b>` + safe(errStr) + `</div>
  <div class="kv"><b>时间</b>` + safe(at) + `</div>
</div>`
	footer := `这是一封系统自动邮件。你可以在通知设置中调整事件与收件人。`
	return htmlShell(siteName, "状态变更", badge, content, footer)
}

func BodySSLExpiry(siteName, monitorName, monitorURL string, daysLeft int, expiresAt string, at string) string {
	badge := `<span class="badge badge--warn">证书到期提醒</span>`
	nameBlock := link(monitorName, monitorURL)
	content := `<div class="section">站点的 SSL 证书即将到期，请尽快更新。</div>
<div class="section">
  <div class="kv"><b>站点名称</b>` + nameBlock + `</div>
  <div class="kv"><b>剩余天数</b>` + itoa(daysLeft) + `</div>
  <div class="kv"><b>到期时间</b>` + safe(expiresAt) + `</div>
  <div class="kv"><b>检测时间</b>` + safe(at) + `</div>
</div>`
	footer := `这是一封系统自动邮件。你可以在通知设置中调整提前提醒天数与收件人。`
	return htmlShell(siteName, "证书到期提醒", badge, content, footer)
}

func BodyTest(siteName, monitorName, monitorURL string, event string, at string) string {
	title := map[string]string{"online": "测试 · 服务恢复", "offline": "测试 · 服务离线", "ssl_expiry": "测试 · 证书到期"}[strings.ToLower(event)]
	if title == "" {
		title = "测试通知"
	}
	badge := `<span class="badge badge--ok">` + title + `</span>`
	nameBlock := link(monitorName, monitorURL)
	cnType := cnEventLabel(event)
	content := `<div class="section">这是一条测试邮件，用于验证通知链路。</div>
<div class="section">
  <div class="kv"><b>站点名称</b>` + nameBlock + `</div>
  <div class="kv"><b>类型</b>` + cnType + `</div>
  <div class="kv"><b>时间</b>` + safe(at) + `</div>
</div>`
	footer := `如果未收到，请检查 SMTP 配置与收件箱垃圾邮件。`
	return htmlShell(siteName, "测试通知", badge, content, footer)
}

func itoa(i int) string { return strconv.Itoa(i) }

func link(name, url string) string {
	n := safe(name)
	u := strings.TrimSpace(url)
	if u == "" {
		return n
	}
	return `<a href="` + u + `" target="_blank" rel="noopener">` + n + `</a>`
}

func cnEventLabel(e string) string {
	switch strings.ToLower(strings.TrimSpace(e)) {
	case "online":
		return "在线"
	case "offline":
		return "离线"
	case "ssl_expiry":
		return "证书到期"
	default:
		return "未知"
	}
}
