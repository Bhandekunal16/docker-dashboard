#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

case "${1:-desktop}" in
  desktop)
    # Electron starts and manages the local Node.js backend automatically.
    npm run desktop:dev
    ;;
  web)
    # Web mode intentionally starts only the backend. Run the Vite frontend
    # separately with: npm run frontend:dev
    npm run server:dev
    ;;
  build)
    npm run desktop:build
    ;;
  test)
    npm test
    ;;
  *)
    echo "Usage: $0 [desktop|web|build|test]"
    echo
    echo "  desktop  Start Electron; Electron starts the backend automatically"
    echo "  web      Start only the backend for browser/frontend use"
    echo "  build    Build desktop installers"
    echo "  test     Run backend and desktop tests"
    exit 1
    ;;
esac
