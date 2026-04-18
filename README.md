# TarotApp

Eine Arbeitshilfe für das physische Legen von Tarot-Karten.

Legemuster auswählen, gezogene Karten mit Orientierung (aufrecht/umgekehrt) erfassen und die passende Interpretation direkt angezeigt bekommen.

---

## Projektstruktur

```
TarotApp/
├── backend/        Spring Boot REST API (Java 21)
├── frontend/       React + TypeScript + Tailwind CSS
└── static/
    └── card_images/720px/   Kartenbilder (78 Karten)
```

---

## Backend

**Stack:** Java 21 · Spring Boot 3.5 · Jackson · springdoc-openapi

### Voraussetzungen

- JDK 21+
- Maven 3.9+

### Starten

```bash
cd backend
mvn spring-boot:run
```

API läuft unter: `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger-ui.html`

### Tests ausführen

```bash
cd backend
mvn test
```

### API-Übersicht

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/cards` | Alle Karten (optional: `?suit=`, `?search=`, `?number=`) |
| GET | `/api/cards/suits` | Alle Kartengruppen |
| GET | `/api/cards/{name}` | Einzelne Karte nach deutschem Namen |
| GET | `/api/cards/{name}/interpretation?orientation=upright\|reversed` | Orientierungsabhängige Interpretation |
| GET | `/api/spreads` | Alle Legemuster (Kurzübersicht) |
| GET | `/api/spreads/{id}` | Legemuster-Detail inkl. Positionen |

**Filterregel für `/api/cards`:** Es darf genau ein Filter gleichzeitig gesetzt sein. Bei mehreren Filtern wird `400 Bad Request` zurückgegeben.

**Fehlerformat** (alle Fehlerfälle):
```json
{
  "status": 404,
  "error": "NOT_FOUND",
  "message": "Keine Karte mit diesem Namen gefunden.",
  "path": "/api/cards/Unbekannt"
}
```

### Datendateien

| Datei | Inhalt |
|-------|--------|
| `src/main/resources/data/complete.json` | 78 Tarot-Karten mit Beschreibungen |
| `src/main/resources/data/images_assertions.json` | Zuordnung Karte → Bilddatei |
| `src/main/resources/data/spreads.json` | Legemuster-Definitionen |

---

## Frontend

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS 4

### Voraussetzungen

- Node.js 20+

### Starten

```bash
cd frontend
npm install
npm run dev
```

App läuft unter: `http://localhost:5173`

### Bauen

```bash
cd frontend
npm run build
```

### Tests

Unit-/Component-Tests mit Vitest:

```bash
cd frontend
npm run test:unit
```

End-to-End-Tests mit Playwright:

```bash
cd frontend
npx playwright install chromium
npm run test:e2e
```

Alle Frontend-Tests lokal hintereinander:

```bash
cd frontend
npm run test
```

CI:
- Frontend-Tests laufen automatisch über `.github/workflows/frontend-tests.yml`
- Trigger: Push/PR auf `dev`, wenn Dateien unter `frontend/**` geändert wurden
- Vollständiger Release-Check für PRs von `dev` nach `main` läuft über `.github/workflows/pr-release-check.yml`
- Dabei werden Backend und Frontend gebaut und alle Tests ausgeführt

---

## Docker (Phase 1)

Für eine OS-unabhängige, einfache Ausführung kannst du Backend und Frontend zusammen per Docker Compose starten.

### Voraussetzungen

- Docker Engine mit Docker Compose Plugin (`docker compose`)

### Starten (Build + Run)

```bash
docker compose up --build
```

App danach unter:

- Frontend: `http://localhost:5173`
- Backend API direkt: `http://localhost:8080`

### Im Hintergrund starten

```bash
docker compose up -d --build
```

### Stoppen

```bash
docker compose down
```

### Hinweise

- Das Frontend läuft in Nginx und leitet `/api/**` sowie `/images/**` intern an den Backend-Service weiter.
- Die Tarot-Bilder werden im Backend-Container unter `/app/static/card_images/720px` bereitgestellt.

---

## Legemuster hinzufügen

Neue Legemuster können ohne Code-Änderung direkt in `backend/src/main/resources/data/spreads.json` ergänzt werden:

```json
{
  "id": "mein-muster",
  "name": "Mein Muster",
  "description": "Beschreibung des Musters.",
  "tags": ["kategorie"],
  "positions": [
    { "index": 1, "key": "pos1", "label": "Titel", "prompt": "Frage?", "layoutX": 0, "layoutY": 0 }
  ]
}
```

---

## CORS

Das Backend erlaubt standardmäßig Anfragen von `http://localhost:5173` und `http://localhost:3000`.  
Konfiguration in `backend/src/main/java/com/tarotapp/config/WebConfig.java`.

---

## Lizenz

- Eigener Quellcode in diesem Repository steht unter der **Apache License 2.0** (siehe `LICENSE`).
- Tarot-Bilder unter `static/card_images/` stammen aus `https://github.com/mixvlad/TarotCards` und stehen laut Upstream unter **Creative Commons NonCommercial (CC BY-NC)**.
- Diese Bilddateien sind **nicht** Teil der Apache-2.0-Lizenz.

Details und Hinweise zu Drittanbieter-Lizenzen: `THIRD_PARTY_LICENSES.md`.
Zusammenfassung der Lizenztrennung: `NOTICE`.

