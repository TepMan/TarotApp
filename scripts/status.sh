#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: scripts/status.sh"
}

if [[ $# -ne 0 ]]; then
  usage
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "$REPO_ROOT"

if [[ ! -f ".env.ghcr" ]]; then
  echo "Fehler: .env.ghcr fehlt." >&2
  echo "Bitte zuerst 'cp .env.ghcr.example .env.ghcr' ausführen und GHCR_OWNER setzen." >&2
  exit 1
fi

GHCR_OWNER="$(grep -E '^GHCR_OWNER=' .env.ghcr | head -n1 | cut -d'=' -f2- || true)"
APP_VERSION="$(grep -E '^APP_VERSION=' .env.ghcr | head -n1 | cut -d'=' -f2- || true)"

if [[ -z "$GHCR_OWNER" || "$GHCR_OWNER" == "your-github-owner" ]]; then
  echo "Fehler: GHCR_OWNER ist in .env.ghcr nicht gesetzt." >&2
  exit 1
fi

if [[ -z "$APP_VERSION" ]]; then
  APP_VERSION="latest"
fi

COMPOSE_ARGS=(--env-file .env.ghcr -f docker-compose.ghcr.yml)
if [[ -f docker-compose.ghcr.override.yml ]]; then
  COMPOSE_ARGS+=(-f docker-compose.ghcr.override.yml)
fi

container_health() {
  local container="$1"
  local status
  if status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container" 2>/dev/null)"; then
    echo "$status"
  else
    echo "not-created"
  fi
}

echo "TarotApp Deployment Status"
echo "- GHCR Owner: ${GHCR_OWNER}"
echo "- Zielversion (APP_VERSION): ${APP_VERSION}"
echo "- Backend Image: ghcr.io/${GHCR_OWNER}/tarotapp-backend:${APP_VERSION}"
echo "- Frontend Image: ghcr.io/${GHCR_OWNER}/tarotapp-frontend:${APP_VERSION}"
echo

echo "Container Health"
echo "- tarotapp-backend: $(container_health tarotapp-backend)"
echo "- tarotapp-frontend: $(container_health tarotapp-frontend)"
echo

echo "Compose Services"
docker compose "${COMPOSE_ARGS[@]}" ps


