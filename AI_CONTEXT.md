# TarotApp - Lernplan und Kontext-Snapshot

Status: 2026-04-15
Zweck: Diese Datei haelt den Ausbildungsplan und den Projektkontext fest, damit ein neuer Chat schnell wieder auf Stand kommt.

## 1) Zielbild
Erfahrener C#/.NET Entwickler lernt Java + Spring durch Bauen einer Tarot-App.
Schwerpunkt: REST API Qualitaet, Spring-Grundlagen, Testing, Persistenz, Betrieb.
Produktziel: Eine Arbeitshilfe fuer physisches Tarot-Legen - Legemuster waehlen, im Muster gezogene Karten auswaehlen und zu jeder Karte schnell die passenden Informationen sehen.

## 2) Lernpfad (7 Wochen)

### Woche 1 - Java im Projekt verstehen
- Fokus: Optional, Streams, Exceptions, POJO/DTO-Denke
- Uebung: Request-Flow vom Entry-Point bis JSON-Loader nachvollziehen
- Uebung: Ein neuer Filter in Card-Endpunkten (z.B. number)
- Fertig wenn: End-to-end Flow erklaerbar und kleiner Filter implementiert

### Woche 2 - Spring Core und DI
- Fokus: Bean-Lifecycle, Constructor Injection, Schichten
- Uebung: Querschnittslogik in eigene Bean extrahieren
- Fertig wenn: Abhaengigkeiten sauber constructor-injected

### Woche 3 - Spring Web + Fehlerbehandlung
- Fokus: ResponseEntity, Statuscodes, ControllerAdvice
- Uebung: Einheitliches Error-JSON (400/404/500)
- Fertig wenn: API-Fehler sind konsistent und dokumentiert

### Woche 4 - Validierung + Tests
- Fokus: Bean Validation, WebMvcTest, Service Unit Tests
- Uebung: Input-DTO mit @Valid, Happy/Error-Path Tests
- Fertig wenn: Kritische Endpunkte mit klaren Tests abgesichert

### Woche 5 - Persistenz: In-Memory/JSON -> JPA
- Fokus: Repository-Abstraktion, Entity vs DTO, schrittweise Migration
- Uebung: Erst Read-Cases auf H2/JPA migrieren
- Fertig wenn: Profilbasierter Wechsel zwischen Datenquellen moeglich

### Woche 6 - Build/Config/Security Basics
- Fokus: Maven, Profiles, application-*.properties, CORS/Security-Basis
- Uebung: dev/test/prod sauber trennen
- Fertig wenn: Reproduzierbarer Build und Basisschutz vorhanden

### Woche 7 - Deployment + Observability
- Fokus: Start in prod-naher Umgebung, Health, Metriken, Logs
- Uebung: Actuator + Logging-Strategie
- Fertig wenn: App laeuft stabil und ist gut analysierbar

## 3) .NET -> Spring Kurzmapping
- Program.cs/Host Builder -> @SpringBootApplication + SpringApplication.run
- IServiceCollection -> @Component/@Service/@Repository/@Bean
- [ApiController] -> @RestController
- ActionResult<T> -> ResponseEntity<T>
- appsettings + Environments -> application.properties + Profiles
- EF Core DbContext -> Spring Data JPA / EntityManager
- xUnit/NUnit + Moq -> JUnit5 + Mockito
- Swashbuckle -> springdoc-openapi

## 4) Aktueller API-Kontext (aus CardController)
Datei: backend/src/main/java/com/tarotapp/controller/CardController.java
- GET /api/cards (optional suit/search/number; genau ein Filter erlaubt)
- GET /api/cards/suits
- GET /api/cards/{name}
- GET /api/cards/{name}/interpretation?orientation=upright|reversed
- Swagger Annotationen sind vorhanden

Datei: backend/src/main/java/com/tarotapp/controller/SpreadController.java
- GET /api/spreads (Summary-Liste der Legemuster)
- GET /api/spreads/{id} (Detail inkl. Positionen)
- 404/500 sind mit `ApiError` dokumentiert

## 5) Aktueller Umsetzungsstand
- Projektstruktur fuer Backend/Frontend ist erstellt.
- Erste API-Implementierung ist vorhanden (CardController + Service-Flows).
- Swagger/OpenAPI ist eingebunden.
- IDE Run/Debug Setup ist eingerichtet.
- Request-Flow fuer die Karten-API wurde analysiert: `TarotAppApplication` -> `CardController` -> `CardService` -> `CardRepository` -> `JsonDataLoader` -> JSON-Dateien.
- CORS ist zentral ueber `WebConfig` konfiguriert (`@CrossOrigin` im Controller entfernt).
- Filterstrategie vereinfacht: In `GET /api/cards` darf genau ein Filter gesetzt werden (`suit`, `search` oder `number`), bei mehreren folgt `400 Bad Request`.
- Web-Layer-Tests fuer den Controller sind vorhanden (`CardControllerWebMvcTest`): Happy Paths (ohne Filter, suit, search, number), 400 bei doppeltem Filter und Verhalten bei leeren Parametern.
- Test-Standard festgelegt: In Spring MVC Tests `@MockitoBean` verwenden, nicht das deprecatede `@MockBean`.
- Globales Error-Handling ist eingefuehrt: `@RestControllerAdvice` liefert konsistentes Error-JSON mit `status`, `error`, `message`, `path` fuer 400/404/500.
- `GET /api/cards/{name}` nutzt fuer unbekannte Karten jetzt ebenfalls das zentrale Error-JSON (404 statt leerem Body).
- OpenAPI/Swagger dokumentiert die Error-Responses jetzt explizit (400/404/500) mit `ApiError`-Schema.
- Erstes API-Modell fuer Legemuster/Positionen ist implementiert (read-only):
  - Modelle: `Spread`, `SpreadSummary`, `SpreadPosition`
  - Schichten: `SpreadRepository` -> `SpreadService` -> `SpreadController`
  - Vordefinierte Muster: `three-card`, `cross-5`
  - WebMvc-Tests: `SpreadControllerWebMvcTest` (Liste, Detail, 404)
- `GET /api/cards/{name}/interpretation` liefert orientierungsabhaengige Karten-Interpretation (`InterpretationResponse`): kernbotschaft, psychologie (aufrecht/umgekehrt), anwendungsfelder, archetyp, imageFile.
- `imagePath` in Card/Interpretation ist auf den oeffentlichen Resource-Pfad normalisiert (`/images/{file}`), damit Kartenbilder im Frontend korrekt geladen werden.
- `WebConfig` registriert mehrere moegliche statische Bildpfade (`./static/...` und `../static/...`), damit `/images/**` unabhaengig vom Startverzeichnis der App funktioniert.
- Backend-Stand ist fuer das beschriebene Produktziel vollstaendig.
- `README.md` fuer das Gesamtprojekt ist vorhanden (Start, API-Uebersicht, Datendateien, CORS).
- GitHub Action `.github/workflows/backend-tests.yml` laeuft auf Pushs und PRs auf `dev`, nur wenn `backend/**` geaendert wurde.
- Frontend Schritt 1 ist umgesetzt: `frontend/src/types/tarot.ts` (DTOs) und `frontend/src/api/tarotApi.ts` (typsichere API-Funktionen fuer spreads/cards/interpretation).
- Frontend Schritt 2 ist umgesetzt: Vite-Template ersetzt durch `ReadingPage`-Skelett (`frontend/src/pages/ReadingPage.tsx`) mit Platzhaltern fuer die naechsten Feature-Komponenten.
- Frontend Schritt 3 ist umgesetzt: `SpreadSelector` laedt Legemuster aus der API, zeigt Loading/Error/Retry und setzt die Auswahl in `ReadingPage`.
- Frontend Schritt 4 ist umgesetzt: `SpreadBoard` laedt Detaildaten via `/api/spreads/{id}` und rendert Positionen grafisch ueber `layoutX/layoutY` (inkl. Loading/Error/Retry).
- Frontend Schritt 5 ist umgesetzt: `PositionEditor` laedt Positionen + Karten, erlaubt pro Position die Auswahl von Karte und Orientierung und meldet die Belegung an `ReadingPage`.
- Frontend Schritt 6 ist umgesetzt: `InterpretationPanel` laedt pro belegter Position die Interpretation via `/api/cards/{name}/interpretation` und zeigt Kernbotschaft/Psychologie/Archetyp inkl. Bild an.
- Frontend-Feinschliff (Schritt 1-3) ist umgesetzt: Branding auf "TepMan's Tarot App", zentrierte Legemuster-Auswahl als Dropdown (Default `three-card`) und neue Seitenstruktur mit Beschreibung oberhalb des prominenten Boards.
- Frontend-Feinschliff (Board-zentrierter Flow) ist umgesetzt: Kartenwahl + Orientierung direkt in den Board-Kacheln, Bildrotation bei umgekehrter Orientierung und Interpretation pro Kachel.
- Frontend-UX erweitert: Kartensuche je Kachel, ein-/ausklappbare Interpretation und Persistenz der Legung pro Legemuster in `localStorage`.
- Karten koennen im aktuellen Legemuster nur einmal gewaehlt werden (Duplikat-Schutz im `SpreadBoard`, inklusive Hinweis im UI).
- Frontend-Testinfrastruktur ist eingerichtet:
  - Unit/Component-Tests mit Vitest + Testing Library
  - E2E-Tests mit Playwright
  - CI-Workflow `.github/workflows/frontend-tests.yml` fuer Push/PR auf `dev`
  - Abgedeckte Kernbausteine: `ReadingPage`, `SpreadSelector`, `SpreadBoard`, E2E-Reading-Flow
- Neuer Release-PR-Workflow `.github/workflows/pr-release-check.yml` laeuft fuer Pull Requests von `dev` nach `main` und baut/testet Backend + Frontend komplett.
- Der Release-PR-Workflow nutzt `concurrency`, damit aeltere Laeufe derselben PR automatisch abgebrochen werden.

## 6) Naechste pragmatische Schritte
1. Optionaler Frontend-Feinschliff: Performance optimieren (Interpretations-Cache card+orientation, Lazy-Loading fuer große Boards).
2. Optional: Service-/Repository-Tests gezielt ausbauen.
3. Optional: Fehlercodes/Fehlermeldungen als feste API-Konstanten standardisieren.

## 7) Kontext im neuen Chat wiederherstellen (Copy/Paste Prompt)
"Nutze bitte den Kontext aus `AI_CONTEXT.md` als Grundlage.
Ich bin erfahrener C# Entwickler und lerne Java/Spring mit der TarotApp.
Aktueller Stand: Projektstruktur + erste API + Swagger + IDE Debug Setup stehen.
Produktziel: Legemuster auswaehlen, gezogene Karten im Muster erfassen und Karteninfos anzeigen.
Bitte starte beim naechsten kleinen Schritt (Code-Verstaendnis und dann neuer Filter)."

## 8) Pflegehinweis
Nach jeder Session kurz aktualisieren:
- Was wurde gebaut?
- Was ist als naechstes dran?
- Offene Fragen/Entscheidungen

