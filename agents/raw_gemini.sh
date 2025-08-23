GEMINI_PROMPT="$1"
echo "Running Gemini in directory: $PWD"

if [ -z "$GEMINI_API_KEY" ]; then
  echo "Error: GEMINI_API_KEY environment variable is not set."
  exit 1
fi


set -x
gemini -p "$GEMINI_PROMPT" --model gemini-2.5-pro --approval-mode=yolo