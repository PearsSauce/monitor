# Codex GitHub Workflow

This project expects Codex to use the local GitHub CLI for GitHub operations.
Codex sessions usually do not have an interactive TTY, so authentication must be
prepared in macOS Terminal first.

## One-time Setup

Run these commands in macOS Terminal:

```bash
brew install gh
gh auth login
gh auth setup-git
```

Use an account with access to `PearsSauce/monitor`. The token needs repository
write access for push and pull request workflows. `workflow` scope is useful when
Codex needs to inspect GitHub Actions runs.

## Verify Codex Readiness

From the repository root, run:

```bash
sh scripts/check-github-cli.sh
```

The script checks:

- `gh` is installed and authenticated
- the current GitHub account can view the repository
- the configured git remote is reachable
- the current branch can be pushed with a dry run
- whether the current shell has a TTY

Use a different remote when needed:

```bash
sh scripts/check-github-cli.sh upstream
```

## Commands Codex Can Run

After authentication is prepared, Codex can safely use non-interactive commands:

```bash
gh repo view PearsSauce/monitor --json nameWithOwner,viewerPermission
gh pr list --repo PearsSauce/monitor
gh issue list --repo PearsSauce/monitor
gh run list --repo PearsSauce/monitor
git push origin main
```

For pull request creation, prefer explicit flags:

```bash
gh pr create \
  --repo PearsSauce/monitor \
  --base main \
  --head feature-branch \
  --title "Change title" \
  --body "Change summary"
```

## What Not To Run Inside Codex

Do not ask Codex to run commands that require interactive prompts:

```bash
gh auth login
gh auth refresh
```

Run those in macOS Terminal, then return to Codex and run the readiness check.

## Troubleshooting

If Codex reports that GitHub is unavailable, run:

```bash
sh scripts/check-github-cli.sh
```

Common outcomes:

- `gh is not installed`: install GitHub CLI in Terminal.
- `gh is not authenticated`: run `gh auth login` in Terminal.
- `permission` is not `ADMIN` or `WRITE`: grant the GitHub account access to the repository.
- `stdin_tty=no` or `stdout_tty=no`: expected inside Codex; use non-interactive commands only.
