#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: scripts/deploy.sh <version> [--dry-run]"
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

if [[ ! -f ".env.ghcr" ]]; then
  if [[ -f ".env.ghcr.example" ]]; then
    cp .env.ghcr.example .env.ghcr
    echo "Hinweis: .env.ghcr wurde aus .env.ghcr.example erstellt."
  else
    echo "Fehler: .env.ghcr und .env.ghcr.example fehlen." >&2
    exit 1
  fi
fi

upsert_env() {
  local file="$1"
  local key="$2"
  local value="$3"
  if grep -qE "^${key}=" "$file"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    printf "%s=%s\n" "$key" "$value" >> "$file"
  fi
}

upsert_env .env.ghcr APP_VERSION "$VERSION"

GHCR_OWNER="$(grep -E '^GHCR_OWNER=' .env.ghcr | head -n1 | cut -d'=' -f2- || true)"
if [[ -z "$GHCR_OWNER" || "$GHCR_OWNER" == "your-github-owner" ]]; then
  echo "Fehler: GHCR_OWNER ist in .env.ghcr nicht gesetzt." >&2
  echo "Bitte GHCR_OWNER in .env.ghcr auf deinen GitHub User/Org (kleingeschrieben) setzen." >&2
  exit 1
fi

COMPOSE_ARGS=(--env-file .env.ghcr -f docker-compose.ghcr.yml)
if [[ -f docker-compose.ghcr.override.yml ]]; then
  COMPOSE_ARGS+=(-f docker-compose.ghcr.override.yml)
fi

run_cmd() {
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "[dry-run] $*"
  else
    "$@"
  fi
}

wait_healthy() {
  local container="$1"
  local timeout_seconds=180
  local elapsed=0

  while (( elapsed < timeout_seconds )); do
    local status
    status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container" 2>/dev/null || true)"

    if [[ "$status" == "healthy" || "$status" == "running" ]]; then
      return 0
    fi

    if [[ "$status" == "exited" || "$status" == "dead" ]]; then
      echo "Fehler: Container '$container' ist nicht gestartet (Status: $status)." >&2
      return 1
    fi

    sleep 2
    elapsed=$((elapsed + 2))
  done

  echo "Fehler: Timeout beim Warten auf Container '$container'." >&2
  return 1
}

echo "Deploy auf Version ${VERSION} (GHCR_OWNER=${GHCR_OWNER})"
run_cmd docker compose "${COMPOSE_ARGS[@]}" pull
run_cmd docker compose "${COMPOSE_ARGS[@]}" up -d

if [[ "$DRY_RUN" == "true" ]]; then
  echo "[dry-run] Healthcheck-Wartephase uebersprungen."
  exit 0
fi

wait_healthy tarotapp-backend
wait_healthy tarotapp-frontend

echo "Deploy erfolgreich. Laufende Services:"
docker compose "${COMPOSE_ARGS[@]}" ps

