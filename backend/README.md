# TarotApp Backend

Spring Boot Backend fuer die TarotApp. Das Backend stellt eine read-only REST-API fuer Karten, Interpretationen und Legemuster bereit.

---

## Inhaltsverzeichnis

- [Techstack](#techstack)
- [Aufgabe des Backends](#aufgabe-des-backends)
- [Starten und Testen](#starten-und-testen)
- [API-Endpunkte](#api-endpunkte)
- [Fehlerformat](#fehlerformat)
- [Datenquellen](#datenquellen)
- [Architektur (kurz)](#architektur-kurz)
- [Konfiguration](#konfiguration)
- [CI](#ci)

---

## Techstack

- Java 21
- Spring Boot 3.5
- Spring Web (REST)
- Jackson (JSON)
- springdoc-openapi (Swagger UI)
- Maven
- JUnit 5 / Spring Boot Test

---

## Aufgabe des Backends

- Karten- und Legemusterdaten aus JSON-Dateien laden
- API-Endpunkte fuer Suche, Filter und Details bereitstellen
- Interpretationsdaten je Karte und Orientierung liefern
- Kartenbilder unter `/images/**` ausliefern

---

## Starten und Testen

Voraussetzungen:

- JDK 21+
- Maven 3.9+

Start:

```bash
cd backend
mvn spring-boot:run
```

Tests:

```bash
cd backend
mvn test
```

API/Docs:

- API Basis: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

---

## API-Endpunkte

### Karten

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/cards` | Alle Karten |
| GET | `/api/cards?suit=...` | Genau ein Suit-Filter |
| GET | `/api/cards?search=...` | Genau eine Namenssuche |
| GET | `/api/cards?number=...` | Genau ein Nummernfilter |
| GET | `/api/cards/suits` | Alle verfuegbaren Suits |
| GET | `/api/cards/{name}` | Einzelkarte nach Namen |
| GET | `/api/cards/{name}/interpretation?orientation=upright|reversed` | Interpretation der Karte |

Wichtige Regel fuer `/api/cards`:

- Es ist genau ein Filter gleichzeitig erlaubt (`suit` oder `search` oder `number`).
- Bei mehreren Filtern kommt `400 Bad Request`.

### Legemuster

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/spreads` | Kompakte Liste aller Legemuster |
| GET | `/api/spreads/{id}` | Legemuster inklusive Positionen |

---

## Fehlerformat

Alle Fehler werden im selben JSON-Format geliefert:

```json
{
  "status": 404,
  "error": "NOT_FOUND",
  "message": "Keine Karte mit diesem Namen gefunden.",
  "path": "/api/cards/Unbekannt"
}
```

Umgesetzt in:

- `src/main/java/com/tarotapp/exception/GlobalExceptionHandler.java`
- `src/main/java/com/tarotapp/api/ApiError.java`

---

## Datenquellen

| Datei | Inhalt |
|-------|--------|
| `src/main/resources/data/complete.json` | 78 Tarot-Karten und Bedeutungen |
| `src/main/resources/data/images_assertions.json` | Zuordnung Karte -> Bilddatei |
| `src/main/resources/data/spreads.json` | Legemuster inkl. Positionen |

Hinweis zu Bildern:

- Die API liefert relative Bildpfade wie `/images/00_Fool.jpg`.
- Auslieferung erfolgt ueber die Resource-Handler in `WebConfig`.

---

## Architektur (kurz)

- `controller/`: REST-Endpunkte
- `service/`: Fachlogik
- `repository/`: Zugriff auf geladene In-Memory-Daten
- `util/JsonDataLoader`: Laden der JSON-Dateien beim Start
- `model/`: Domainmodelle (`Card`, `Spread`, `SpreadPosition`)
- `api/`: DTOs fuer API-Antworten
- `config/`: CORS, statische Ressourcen, OpenAPI

---

## Konfiguration

Wichtige Stellen:

- `src/main/resources/application.properties`
  - `server.port=8080`
  - Swagger/OpenAPI-Pfade
  - statische Ressourcen
- `src/main/java/com/tarotapp/config/WebConfig.java`
  - CORS fuer `/api/**`
  - Bildauslieferung unter `/images/**`
- `src/main/java/com/tarotapp/config/OpenApiConfig.java`
  - OpenAPI-Metadaten

---

## CI

Workflow fuer Backend-Tests:

- `.github/workflows/backend-tests.yml`

Zusatzcheck bei PR von `dev` nach `main`:

- `.github/workflows/pr-release-check.yml`

