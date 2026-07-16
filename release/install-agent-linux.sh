#!/usr/bin/env sh
set -eu

need_root() {
  if [ "$(id -u)" -ne 0 ]; then
    echo "please run as root: sudo sh $0" >&2
    exit 1
  fi
}

ask() {
  prompt="$1"
  default="${2:-}"
  if [ -n "$default" ]; then
    printf "%s [%s]: " "$prompt" "$default" >&2
  else
    printf "%s: " "$prompt" >&2
  fi
  if [ -r /dev/tty ] && [ -w /dev/tty ]; then
    IFS= read -r value </dev/tty || value=""
  else
    value=""
  fi
  if [ -z "$value" ]; then value="$default"; fi
  printf "%s" "$value"
}

ask_secret() {
  prompt="$1"
  printf "%s: " "$prompt" >&2
  if [ -r /dev/tty ] && [ -w /dev/tty ]; then
    stty -echo </dev/tty >/dev/tty 2>/dev/null || true
    IFS= read -r value </dev/tty || value=""
    stty echo </dev/tty >/dev/tty 2>/dev/null || true
    printf "\n" >&2
  else
    value=""
  fi
  printf "%s" "$value"
}

arch_name() {
  case "$(uname -m)" in
    x86_64|amd64) echo "amd64" ;;
    aarch64|arm64) echo "arm64" ;;
    armv7l|armv7*) echo "armv7" ;;
    i386|i686) echo "386" ;;
    *) echo "unsupported" ;;
  esac
}

find_binary() {
  arch="$1"
  for name in "./vps-agent-linux-$arch" "./release/vps-agent-linux-$arch" "./vps-agent"; do
    if [ -f "$name" ]; then echo "$name"; return 0; fi
  done
  return 1
}

need_arg() {
  option="$1"
  remaining="$2"
  if [ "$remaining" -lt 2 ]; then
    echo "$option requires a value" >&2
    exit 2
  fi
}

usage() {
  cat >&2 <<'EOF'
usage: install-agent-linux.sh [options]

Options:
  --server URL
  --token TOKEN
  --node-id NODE
  --basic-interval DURATION
  --disk-interval DURATION
  --connection-interval DURATION
  --mounts MOUNTS
  --bin-url URL
EOF
}

SERVER=""
TOKEN=""
NODE_ID=""
BASIC_INTERVAL=""
DISK_INTERVAL=""
CONNECTION_INTERVAL=""
MOUNTS=""
BIN_URL=""

while [ "$#" -gt 0 ]; do
  case "$1" in
    --server) need_arg "$1" "$#"; SERVER="$2"; shift 2 ;;
    --token) need_arg "$1" "$#"; TOKEN="$2"; shift 2 ;;
    --node-id) need_arg "$1" "$#"; NODE_ID="$2"; shift 2 ;;
    --basic-interval) need_arg "$1" "$#"; BASIC_INTERVAL="$2"; shift 2 ;;
    --disk-interval) need_arg "$1" "$#"; DISK_INTERVAL="$2"; shift 2 ;;
    --connection-interval) need_arg "$1" "$#"; CONNECTION_INTERVAL="$2"; shift 2 ;;
    --mounts) need_arg "$1" "$#"; MOUNTS="$2"; shift 2 ;;
    --bin-url) need_arg "$1" "$#"; BIN_URL="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown option: $1" >&2; usage; exit 2 ;;
  esac
done

need_root

ARCH="$(arch_name)"
if [ "$ARCH" = "unsupported" ]; then
  echo "unsupported architecture: $(uname -m)" >&2
  exit 1
fi

echo "VPS Monitor agent installer"
echo "detected: linux/$ARCH"

if [ -z "$SERVER" ]; then SERVER="$(ask "Center server URL" "https://www.monitor.party")"; fi
if [ -z "$TOKEN" ]; then TOKEN="$(ask_secret "Agent token")"; fi
if [ -z "$NODE_ID" ]; then NODE_ID="$(ask "Node ID" "$(hostname)")"; fi
if [ -z "$BASIC_INTERVAL" ]; then BASIC_INTERVAL="$(ask "Basic interval" "2s")"; fi
if [ -z "$DISK_INTERVAL" ]; then DISK_INTERVAL="$(ask "Disk interval" "30s")"; fi
if [ -z "$CONNECTION_INTERVAL" ]; then CONNECTION_INTERVAL="$(ask "Connection interval" "60s")"; fi
if [ -z "$MOUNTS" ]; then MOUNTS="$(ask "Mounts" "auto")"; fi
if [ -z "$BIN_URL" ]; then BIN_URL="$(ask "Binary download URL (empty for local file)" "")"; fi
if [ -z "$TOKEN" ]; then
  echo "agent token is required" >&2
  exit 2
fi

install -d /etc/vps-agent /usr/local/bin
umask 077

if [ -n "$BIN_URL" ]; then
  TMP="$(mktemp)"
  curl -fsSL "$BIN_URL" -o "$TMP"
  install -m 0755 "$TMP" /usr/local/bin/vps-agent
  rm -f "$TMP"
else
  BIN="$(find_binary "$ARCH")" || { echo "vps-agent binary not found for linux/$ARCH" >&2; exit 1; }
  install -m 0755 "$BIN" /usr/local/bin/vps-agent
fi

cat >/etc/vps-agent/config.env <<EOF
SERVER=$SERVER
TOKEN=$TOKEN
NODE_ID=$NODE_ID
BASIC_INTERVAL=$BASIC_INTERVAL
DISK_INTERVAL=$DISK_INTERVAL
CONNECTION_INTERVAL=$CONNECTION_INTERVAL
MOUNTS=$MOUNTS
NETWORK_EXCLUDE=lo,docker*,veth*,br-*
DISK_EXCLUDE_FS=tmpfs,devtmpfs,overlay,squashfs,proc,sysfs,cgroup,cgroup2
EOF
chmod 600 /etc/vps-agent/config.env

cat >/etc/systemd/system/vps-agent.service <<'EOF'
[Unit]
Description=Lightweight VPS Monitor Agent
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/usr/local/bin/vps-agent run --config /etc/vps-agent/config.env
Restart=always
RestartSec=3
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
EOF

/usr/local/bin/vps-agent test --config /etc/vps-agent/config.env || true
systemctl daemon-reload
systemctl enable --now vps-agent
systemctl --no-pager --full status vps-agent || true
echo "agent installed: $NODE_ID -> $SERVER"
