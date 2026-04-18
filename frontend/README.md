# TarotApp Frontend

React-Frontend fuer die TarotApp. Die UI bildet Legemuster visuell ab, verwaltet die Kartenauswahl pro Position und zeigt zu jeder gewaehlten Karte die passende Interpretation an.

---

## Inhaltsverzeichnis

- [Techstack](#techstack)
- [Hauptfunktionen im Frontend](#hauptfunktionen-im-frontend)
- [Architektur und wichtige Dateien](#architektur-und-wichtige-dateien)
- [Lokale Entwicklung](#lokale-entwicklung)
- [Build](#build)
- [Konfiguration](#konfiguration)
- [Tests](#tests)
- [CI](#ci)
- [Docker-Hinweis](#docker-hinweis)

---

## Techstack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- Vitest + Testing Library
- Playwright

---

## Hauptfunktionen im Frontend

- Legemuster per Dropdown auswaehlen
- Positionen im Board darstellen (auch komplexe Layouts)
- Karten pro Position waehlen, inklusive Suche und Vorschlaege
- Doppelte Karten innerhalb einer Legung verhindern
- Orientierung umschalten (aufrecht/umgekehrt)
- Bild + Interpretation pro Position anzeigen
- App-Version in der Footer-Zeile anzeigen

---

## Architektur und wichtige Dateien

- `src/pages/ReadingPage.tsx`
  - Seitenaufbau (Header, Musterauswahl, Board)
- `src/features/reading/SpreadSelector.tsx`
  - Laden und Auswahl der Legemuster
  - Gruppierung/Sortierung nach Lernstufe
- `src/features/reading/SpreadBoard.tsx`
  - Kernlogik fuer Positionen, Kartenwahl, Orientierung, Interpretation
- `src/api/tarotApi.ts`
  - API-Client fuer Backend-Endpunkte
- `src/types/tarot.ts`
  - gemeinsame Typen fuer API-Daten

Styling:

- `src/index.css` (globale Styles, Farben, Typografie)
- `src/pages/ReadingPage.css` (Seiten-/Board-Layout)
- `src/App.css` (App-Shell inkl. Footer)

---

## Lokale Entwicklung

Voraussetzung:

- Node.js 20+

Start:

```bash
cd frontend
npm install
npm run dev
```

Standard-URL:

- `http://localhost:5173`

Das Frontend spricht per Default mit dem Backend unter `http://localhost:8080` (oder ueber den Vite-Proxy).

---

## Build

```bash
cd frontend
npm run build
```

Vorschau des Builds:

```bash
cd frontend
npm run preview
```

---

## Konfiguration

### API-Basis-URL

- Variable: `VITE_API_BASE_URL`
- Verwendet in `src/api/tarotApi.ts`
- Fallback ohne Variable: `http://localhost:8080`

Beispiel:

```bash
VITE_API_BASE_URL=http://localhost:8080 npm run dev
```

### App-Version im Footer

- Wird zur Build-Zeit aus `package.json` in `__APP_VERSION__` injiziert
- Konfiguration: `vite.config.ts`
- Anzeige: `src/App.tsx`

---

## Tests

### Unit- und Component-Tests

```bash
cd frontend
npm run test:unit
```

Watch-Modus:

```bash
cd frontend
npm run test:unit:watch
```

### End-to-End-Tests

```bash
cd frontend
npx playwright install chromium
npm run test:e2e
```

UI-Modus:

```bash
cd frontend
npm run test:e2e:ui
```

Alle Frontend-Tests:

```bash
cd frontend
npm run test
```

Wichtige Testdateien:

- `src/features/reading/__tests__/SpreadSelector.test.tsx`
- `src/features/reading/__tests__/SpreadBoard.test.tsx`
- `src/pages/__tests__/ReadingPage.test.tsx`
- `tests/e2e/reading-flow.spec.ts`

---

## CI

Frontend-Workflow:

- `.github/workflows/frontend-tests.yml`

Ablauf:

1. `npm ci`
2. `npm run test:unit`
3. `npx playwright install --with-deps chromium`
4. `npm run test:e2e`

Bei Fehlern wird der Playwright-Report als Artifact hochgeladen.

---

## Docker-Hinweis

Im Docker-Deployment wird das Frontend als statischer Build in Nginx ausgeliefert.

- Dockerfile: `frontend/Dockerfile`
- Nginx-Konfiguration: `frontend/nginx/default.conf`
- Proxy intern auf Backend fuer `/api/**` und `/images/**`

