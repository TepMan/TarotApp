# TarotApp - Lernplan und Kontext-Snapshot

Status: 2026-04-15
Zweck: Diese Datei haelt den Ausbildungsplan und den Projektkontext fest, damit ein neuer Chat schnell wieder auf Stand kommt.

## 1) Zielbild
Erfahrener C#/.NET Entwickler lernt Java + Spring durch Bauen einer Tarot-App.
Schwerpunkt: REST API Qualitaet, Spring-Grundlagen, Testing, Persistenz, Betrieb.

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
- GET /api/cards (optional suit/search)
- GET /api/cards/suits
- GET /api/cards/{name}
- Swagger Annotationen sind vorhanden

## 5) Naechste pragmatische Schritte
1. Zentrale Fehlerbehandlung mit @ControllerAdvice einfuehren.
2. Validation fuer Query-Input vorbereiten.
3. Erste Web-Layer Tests fuer CardController schreiben.

## 6) Kontext im neuen Chat wiederherstellen (Copy/Paste Prompt)
"Nutze bitte den Kontext aus `AI_CONTEXT.md` als Grundlage.
Ich bin erfahrener C# Entwickler und lerne Java/Spring mit der TarotApp.
Bitte starte bei Woche X und gib mir die naechsten kleinen Lernschritte mit Fokus auf Praxis im bestehenden Projekt."

## 7) Pflegehinweis
Nach jeder Session kurz aktualisieren:
- Was wurde gebaut?
- Was ist als naechstes dran?
- Offene Fragen/Entscheidungen

