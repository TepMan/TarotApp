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

## 6) Naechste pragmatische Schritte
1. Service-/Repository-Tests gezielt ausbauen (insb. Spread-Service).
2. API fuer eine konkrete Legung vorbereiten (Position -> gewaehlte Karte + Orientierung).
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

