CODEX_PROMPT="$1"
echo "Running Codex in directory: $PWD"

set -x
codex exec "$CODEX_PROMPT" --full-auto --skip-git-repo-check