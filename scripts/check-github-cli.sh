#!/usr/bin/env sh
set -eu

export GH_PROMPT_DISABLED=1

REMOTE="${1:-origin}"

section() {
  printf "\n== %s ==\n" "$1"
}

fail() {
  printf "ERROR: %s\n" "$*" >&2
  exit 1
}

warn() {
  printf "WARN: %s\n" "$*" >&2
}

repo_from_remote_url() {
  url="$1"
  case "$url" in
    git@github.com:*)
      repo="${url#git@github.com:}"
      ;;
    ssh://git@github.com/*)
      repo="${url#ssh://git@github.com/}"
      ;;
    https://github.com/*)
      repo="${url#https://github.com/}"
      ;;
    http://github.com/*)
      repo="${url#http://github.com/}"
      ;;
    https://*@github.com/*)
      repo="$(printf "%s" "$url" | sed 's#https://[^@]*@github.com/##')"
      ;;
    *)
      fail "remote '$REMOTE' is not a github.com remote: $url"
      ;;
  esac
  repo="${repo%.git}"
  repo="${repo%/}"
  printf "%s" "$repo"
}

section "GitHub CLI"
if ! command -v gh >/dev/null 2>&1; then
  fail "gh is not installed. Install it in Terminal, then run: gh auth login && gh auth setup-git"
fi
printf "path=%s\n" "$(command -v gh)"
gh --version | sed -n '1p'

section "Codex TTY"
if [ -t 0 ]; then stdin_tty=yes; else stdin_tty=no; fi
if [ -t 1 ]; then stdout_tty=yes; else stdout_tty=no; fi
printf "stdin_tty=%s\nstdout_tty=%s\n" "$stdin_tty" "$stdout_tty"
if [ "$stdin_tty" = "no" ] || [ "$stdout_tty" = "no" ]; then
  warn "interactive commands such as 'gh auth login' should be run in macOS Terminal, not inside Codex"
fi

section "Authentication"
gh auth status || fail "gh is not authenticated. Run 'gh auth login' in Terminal."

section "Repository"
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "not inside a git repository"
git remote get-url "$REMOTE" >/dev/null 2>&1 || fail "remote '$REMOTE' does not exist"
REMOTE_URL="$(git remote get-url "$REMOTE")"
REPOSITORY="$(repo_from_remote_url "$REMOTE_URL")"
printf "remote=%s\nurl=%s\nrepo_from_remote=%s\n" "$REMOTE" "$REMOTE_URL" "$REPOSITORY"
gh repo view "$REPOSITORY" --json nameWithOwner,viewerPermission,defaultBranchRef \
  --jq '"repo=\(.nameWithOwner)\npermission=\(.viewerPermission)\ndefault_branch=\(.defaultBranchRef.name)"'

section "Git Remote Access"
git ls-remote "$REMOTE" HEAD

BRANCH="$(git branch --show-current)"
if [ -z "$BRANCH" ]; then
  warn "detached HEAD; skipping git push dry-run"
else
  section "Push Dry Run"
  git push --dry-run "$REMOTE" "$BRANCH"
fi

section "Result"
printf "GitHub CLI is ready for non-interactive Codex workflows.\n"
