
CLAUDE_PROMPT="$1"
echo "Running Claude Code in directory: $PWD"

set -x
claude -p "$CLAUDE_PROMPT" --verbose --output-format=stream-json --dangerously-skip-permissions
