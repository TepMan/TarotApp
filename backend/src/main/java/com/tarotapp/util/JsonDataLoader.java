package com.tarotapp.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tarotapp.model.Card;
import com.tarotapp.model.ImageAssertion;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Lädt die JSON-Datendateien beim Start der Anwendung.
 * Component  → Spring registriert diese Klasse als Bean (wie [Service] in C#)
 * PostConstruct → Methode wird nach dem Dependency-Injection aufgerufen
 *                  (wie ein Konstruktor, aber Spring hat bereits alle Abhängigkeiten gesetzt)
 */
@Component
public class JsonDataLoader {

    private static final Logger logger = LoggerFactory.getLogger(JsonDataLoader.class);

    // ObjectMapper ist Jacksons Hauptklasse für JSON-Verarbeitung
    // Vergleichbar mit JsonConvert in Newtonsoft.Json (C#)
    private final ObjectMapper objectMapper = new ObjectMapper();

    private List<Card> cards;
    private List<ImageAssertion> imageAssertions;

    /**
     * Wird automatisch nach Erstellung dieser Bean aufgerufen.
     * Lädt beide JSON-Dateien und verknüpft Karten mit ihren Bildern.
     */
    @PostConstruct
    public void loadData() {
        try {
            cards = loadCards();
            imageAssertions = loadImageAssertions();
            enrichCardsWithImages();
            logger.info("✅ {} Karten und {} Bild-Zuordnungen erfolgreich geladen.",
                    cards.size(), imageAssertions.size());
        } catch (IOException e) {
            logger.error("❌ Fehler beim Laden der JSON-Daten: {}", e.getMessage());
            throw new RuntimeException("JSON-Datendateien konnten nicht geladen werden.", e);
        }
    }

    /**
     * Liest complete.json aus dem Classpath (src/main/resources/data/).
     * TypeReference ist Jacksons Weg, um Generic-Types anzugeben (List<Card>).
     */
    private List<Card> loadCards() throws IOException {
        InputStream stream = new ClassPathResource("data/complete.json").getInputStream();
        return objectMapper.readValue(stream, new TypeReference<List<Card>>() {});
    }

    /**
     * Liest images_assertions.json aus dem Classpath.
     */
    private List<ImageAssertion> loadImageAssertions() throws IOException {
        InputStream stream = new ClassPathResource("data/images_assertions.json").getInputStream();
        return objectMapper.readValue(stream, new TypeReference<List<ImageAssertion>>() {});
    }

    /**
     * Verknüpft jede Karte mit ihrer Bildzuordnung anhand des deutschen Namens.
     * Java Streams sind das Äquivalent zu LINQ in C#:
     *   imageAssertions.stream()           →  imageAssertions.AsEnumerable()
     *   .collect(Collectors.toMap(...))    →  .ToDictionary(...)
     */
    private void enrichCardsWithImages() {
        Map<String, ImageAssertion> imageMap = imageAssertions.stream()
                .collect(Collectors.toMap(
                        ImageAssertion::getGermanName,  // Key:   deutscher Name
                        ia -> ia,                        // Value: das ImageAssertion-Objekt
                        (existing, duplicate) -> existing // bei Duplikaten: ersten behalten
                ));

        for (Card card : cards) {
            ImageAssertion assertion = imageMap.get(card.getName());
            if (assertion != null) {
                card.setImageFile(assertion.getImageFile());
                // Liefert den oeffentlichen URL-Pfad, den WebConfig unter /images/** bereitstellt.
                card.setImagePath("/images/" + assertion.getImageFile());
            } else {
                logger.warn("⚠️ Kein Bild gefunden für Karte: '{}'", card.getName());
            }
        }
    }

    // --- Public Getter für andere Beans ---

    public List<Card> getCards() {
        return cards;
    }

    public List<ImageAssertion> getImageAssertions() {
        return imageAssertions;
    }
}

