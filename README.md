# TarotApp

TarotApp ist eine digitale Arbeitshilfe für das physische Legen von Tarot-Karten.

Du wählst ein Legemuster, trägst je Position die gezogene Karte inkl. Orientierung ein und bekommst direkt Hinweise zur Interpretation.

---

## Inhaltsverzeichnis

- [Schnellstart](#schnellstart)
- [Installations- und Startvarianten](#installations--und-startvarianten)
- [Skripte erklärt (`scripts/`)](#skripte-erklart-scripts)
- [Versionierung und CI](#versionierung-und-ci)
- [Lizenz](#lizenz)

---

## Schnellstart

### Bedienung in 4 Schritten

1. Legemuster auswählen (z. B. 3-Karten-Legung oder Keltisches Kreuz).
2. Pro Position eine Karte auswählen.
3. Bei Bedarf Orientierung umschalten (aufrecht/umgekehrt).
4. Interpretation pro Position lesen.

### Wichtige Projektteile

- `backend/`: Spring Boot API, Datenmodell, JSON-Datenquellen
- `frontend/`: React UI, Board-Logik, Tests
- `static/card_images/720px/`: Tarot-Bilder

Detaillierte technische Doku:

- `backend/README.md`
- `frontend/README.md`

---

## Installations- und Startvarianten

### 1) Lokal als Entwicklungsumgebung (ohne Docker)

Voraussetzungen:

- JDK 21+
- Maven 3.9+
- Node.js 20+

Backend starten:

```bash
cd backend
mvn spring-boot:run
```

Frontend starten (zweites Terminal):

```bash
cd frontend
npm install
npm run dev
```

Aufruf:

- Frontend: `http://localhost:5173`
- Backend/Swagger: `http://localhost:8080/swagger-ui.html`

### 2) Docker mit lokalem Build

Ein Befehl für Backend + Frontend:

```bash
docker compose up -d --build
```

Stoppen:

```bash
docker compose down
```

Optional lokale Anpassungen (z. B. Ports):

```bash
cp docker-compose.override.example.yml docker-compose.override.yml
```

### 3) Docker mit fertigen GHCR-Images (Deployment)

Konfiguration anlegen:

```bash
cp .env.ghcr.example .env.ghcr
```

Dann in `.env.ghcr` setzen:

- `GHCR_OWNER` (GitHub User/Org, kleingeschrieben)
- `APP_VERSION` (z. B. `1.0.2`, `1.0`, `latest`)

Starten:

```bash
docker compose --env-file .env.ghcr -f docker-compose.ghcr.yml up -d
```

Update:

```bash
docker compose --env-file .env.ghcr -f docker-compose.ghcr.yml pull
docker compose --env-file .env.ghcr -f docker-compose.ghcr.yml up -d
```

Stoppen:

```bash
docker compose --env-file .env.ghcr -f docker-compose.ghcr.yml down
```

Optional GHCR-Override (eigene Ports):

```bash
cp docker-compose.ghcr.override.example.yml docker-compose.ghcr.override.yml
```

---

## Skripte erklärt (`scripts/`)

- `scripts/deploy.sh <version>`
  - setzt `APP_VERSION` in `.env.ghcr`
  - zieht Images aus GHCR und startet/aktualisiert Container
  - wartet auf Healthchecks
- `scripts/rollback.sh <version>`
  - führt einen gezielten Rollback auf eine ältere Version aus
- `scripts/status.sh`
  - zeigt Zielversion aus `.env.ghcr`, Container-Health und Compose-Status

Beispiele:

```bash
bash scripts/deploy.sh 1.0.2
bash scripts/rollback.sh 1.0.1
bash scripts/status.sh
```

Trockenlauf (ohne echte Docker-Aktion):

```bash
bash scripts/deploy.sh 1.0.2 --dry-run
```

---

## Versionierung und CI

- Zentrale Versionsquelle: `version.json`
- Push auf `dev`: Patch-Bump (x.y.z -> x.y.z+1)
- Push auf `main`: Minor-Bump (x.y.z -> x.(y+1).0)
- Major-Version wird manuell in `version.json` erhöht
- GHCR-Publishing läuft nur bei Push auf `main`

---

## Lizenz

- Eigener Quellcode steht unter **Apache License 2.0** (`LICENSE`)
- Tarot-Bilder unter `static/card_images/` stammen aus `https://github.com/mixvlad/TarotCards` und stehen laut Upstream unter **CC BY-NC**
- Bilddateien sind nicht Teil der Apache-2.0-Lizenz

Mehr Details: `THIRD_PARTY_LICENSES.md` und `NOTICE`.

