#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

cd "$ROOT"

echo "== Go test =="
go test ./...

echo "== Go vet =="
go vet ./...

echo "== Go build =="
go build ./cmd/vps-server ./cmd/vps-agent

GOVULNCHECK_BIN="${GOVULNCHECK:-govulncheck}"
if ! command -v "$GOVULNCHECK_BIN" >/dev/null 2>&1 && [ -x "$(go env GOPATH)/bin/govulncheck" ]; then
  GOVULNCHECK_BIN="$(go env GOPATH)/bin/govulncheck"
fi

if command -v "$GOVULNCHECK_BIN" >/dev/null 2>&1; then
  echo "== Go vulnerability scan =="
  "$GOVULNCHECK_BIN" ./...
else
  echo "== Go vulnerability scan =="
  echo "govulncheck not found; install with: go install golang.org/x/vuln/cmd/govulncheck@latest"
fi

echo "== Web checks =="
cd "$ROOT/web"
if [ "${SKIP_NPM_CI:-0}" != "1" ]; then
  npm ci
fi
npm run check
