#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: scripts/rollback.sh <version> [--dry-run]"
}

if [[ $# -lt 1 || $# -gt 2 ]]; then
  usage
  exit 1
fi

VERSION=""
DRY_RUN=false
for arg in "$@"; do
  if [[ "$arg" == "--dry-run" ]]; then
    DRY_RUN=true
  elif [[ -z "$VERSION" ]]; then
    VERSION="$arg"
  else
    usage
    exit 1
  fi
done

if [[ -z "$VERSION" ]]; then
  usage
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "$REPO_ROOT"

echo "Rollback auf Version ${VERSION} wird vorbereitet."
if [[ "$DRY_RUN" == "true" ]]; then
  bash scripts/deploy.sh "$VERSION" --dry-run
else
  bash scripts/deploy.sh "$VERSION"
fi

echo "Rollback abgeschlossen."

