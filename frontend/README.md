# Frontend der TarotApp

React + TypeScript + Vite Frontend für die Tarot-App.

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Standardmäßig läuft die App unter:
- `http://localhost:5173`

Das Frontend spricht lokal mit dem Backend unter:
- `http://localhost:8080`

## Build

```bash
npm run build
```

## Tests

### Unit- und Component-Tests

Vitest + Testing Library:

```bash
npm run test:unit
```

Watch-Modus:

```bash
npm run test:unit:watch
```

### End-to-End-Tests

Playwright:

```bash
npx playwright install chromium
npm run test:e2e
```

Interaktiver UI-Modus:

```bash
npm run test:e2e:ui
```

### Alles zusammen

```bash
npm run test
```

## Teststrategie

- **Unit/Component-Tests** prüfen Rendering, Fehlerzustände und Interaktionen einzelner Komponenten.
- **E2E-Tests** prüfen den Nutzerfluss im Browser.
- Die E2E-Tests mocken die API-Antworten im Browser, damit sie stabil und unabhängig vom laufenden Backend sind.

## CI

GitHub Actions Workflow:
- `.github/workflows/frontend-tests.yml`

Ablauf:
1. `npm ci`
2. `npm run test:unit`
3. `npx playwright install --with-deps chromium`
4. `npm run test:e2e`

Bei Fehlern wird der Playwright-Report als Artifact hochgeladen.
