
#!/usr/bin/env bash

set -euo pipefail

# Navigate to the project root
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "🚀 Building Docker Manager frontend..."

# Build frontend
cd frontend
npm run build

# Return to project root
cd "$PROJECT_DIR"

# Activate Python virtual environment
if [[ ! -f "venv/bin/activate" ]]; then
    echo "❌ Python virtual environment not found: $PROJECT_DIR/venv"
    exit 1
fi

echo "🐍 Activating Python virtual environment..."
source venv/bin/activate

# Start Flask application
echo "🌐 Starting Flask application..."
exec python3 index.py