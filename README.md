# Monitor Dashboard

一个现代化的服务监控仪表盘，基于 Next.js 和 Go 构建。提供实时状态监控、SSL 证书检查、异常通知轮播及管理后台功能。支持响应式设计，完美适配移动端与桌面端。

## 作者
<a href="https://status.nsuuu.com" target="_blank" rel="noopener noreferrer">青桔气球</a>

## 功能特性

- **实时监控**：支持 HTTP/HTTPS 服务状态实时检测
- **SSL 预警**：自动检查 SSL 证书有效期，提供过期预警
- **响应式设计**：
  - 桌面端：完整的数据表格、图表展示
  - 移动端：卡片式布局、折叠菜单、触屏优化
- **异常通知**：
  - 首页顶部轮播展示最新的异常/恢复信息
  - 支持 SMTP 邮件通知
- **管理后台**：
  - 站点增删改查
  - 批量管理分组
  - 系统参数配置（检测间隔、重试次数等）
- **可视化图表**：状态趋势图、响应时间统计（基于 Recharts）

## 技术栈

### Backend (后端)
- **Language**: Go 1.24+
- **Database**: PostgreSQL
- **Key Libraries**:
  - `lib/pq`: PostgreSQL 驱动
  - `golang-jwt`: JWT 认证

### Frontend (前端)
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **UI Component**: shadcn/ui (Based on Radix UI)
- **Styling**: Tailwind CSS v4
- **Animation**: GSAP, CSS Animations
- **Charts**: Recharts

## 快速开始

### 前置要求
- Go 1.24 或更高版本
- Node.js 18+
- PostgreSQL 数据库

### 1. 启动后端服务

配置环境变量并运行：

```bash
# 设置数据库连接 (根据实际情况修改)
export DATABASE_URL="postgres://user:password@localhost:5432/monitor?sslmode=disable"
export JWT_SECRET="your-secret-key"

# 运行服务
go run cmd/server/main.go
```

后端默认监听端口 `:8080`。

### 2. 启动前端开发服务器

```bash
cd next-web
npm install
npm run dev
```

访问 `http://localhost:3000` 查看仪表盘。

## 预览地址

- <a href="https://status.nsuuu.com" target="_blank" rel="noopener noreferrer">https://status.nsuuu.com</a>

## 环境变量配置

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `ADDR` | `:8080` | 服务监听地址 |
| `DATABASE_URL` | `postgres://...` | 数据库连接字符串 |
| `JWT_SECRET` | `default-jwt-secret-key` | JWT 签名密钥 |
| `ADMIN_PASSWORD` | (空) | 初始管理员密码（首次运行时设置） |
| `CHECK_INTERVAL_SECONDS` | `60` | 默认检查间隔(秒) |

## 目录结构

```
.
├── cmd/server/      # 后端入口
├── internal/        # 后端业务逻辑
│   ├── api/         # HTTP API 处理器
│   ├── db/          # 数据库操作
│   ├── monitor/     # 监控核心逻辑
│   └── notify/      # 通知服务 (SMTP)
├── next-web/        # 前端 Next.js 项目
│   ├── src/         # 源代码
│   │   ├── app/     # App Router 页面
│   │   ├── components/ # UI 组件
│   │   └── lib/     # 工具函数
│   └── public/      # 静态资源
└── go.mod           # Go 依赖定义
```

## License

MIT License

Copyright (c) 2025 青桔气球

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
