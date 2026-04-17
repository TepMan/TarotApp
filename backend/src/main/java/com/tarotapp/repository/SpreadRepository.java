package com.tarotapp.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tarotapp.model.Spread;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;

/**
 * Read-only Repository fuer vordefinierte Legemuster.
 * Laedt die Daten beim Start aus data/spreads.json – analog zu JsonDataLoader.
 * {@code @PostConstruct} -> Methode wird nach dem Dependency-Injection aufgerufen,
 * genau wie in JsonDataLoader.
 */
@Repository
public class SpreadRepository {

    private static final Logger logger = LoggerFactory.getLogger(SpreadRepository.class);

    private final ObjectMapper objectMapper = new ObjectMapper();
    private List<Spread> spreads;

    @PostConstruct
    public void loadData() {
        try {
            InputStream stream = new ClassPathResource("data/spreads.json").getInputStream();
            spreads = objectMapper.readValue(stream, new TypeReference<>() {});
            logger.info("✅ {} Legemuster erfolgreich geladen.", spreads.size());
        } catch (IOException e) {
            logger.error("❌ Fehler beim Laden von spreads.json: {}", e.getMessage());
            throw new RuntimeException("spreads.json konnte nicht geladen werden.", e);
        }
    }

    public List<Spread> findAll() {
        return spreads;
    }

    public Optional<Spread> findById(String id) {
        return spreads.stream()
                .filter(spread -> spread.id().equalsIgnoreCase(id))
                .findFirst();
    }
}
