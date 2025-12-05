#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [ ! -d ".venv" ]; then
  python -m venv .venv
fi

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
  # Windows Git Bash / Cygwin
  source .venv/Scripts/activate
else
  source .venv/bin/activate
fi

python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo "Environment ready. Activate with:"
echo "  source \"$ROOT_DIR/.venv/bin/activate\""
echo "Then run:"
echo "  python agent.py"
