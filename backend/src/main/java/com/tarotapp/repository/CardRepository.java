package com.tarotapp.repository;

import com.tarotapp.model.Card;
import com.tarotapp.util.JsonDataLoader;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Datenzugriffs-Schicht: Stellt Such- und Filterfunktionen bereit.
 * In C# wäre das ein IRepository<Card> mit LINQ-Implementierung.
 * {@code @Repository} -> Spring registriert diese Klasse als Daten-Bean
 * Alle Daten liegen im Arbeitsspeicher (kein DB-Zugriff nötig).
 */
@Repository
public class CardRepository {

    // Dependency Injection via Konstruktor (empfohlener Weg in Spring)
    // Entspricht: public CardRepository(JsonDataLoader loader) in C# mit DI-Container
    private final JsonDataLoader dataLoader;

    public CardRepository(JsonDataLoader dataLoader) {
        this.dataLoader = dataLoader;
    }

    /**
     * Gibt alle Karten zurück.
     */
    public List<Card> findAll() {
        return dataLoader.getCards();
    }

    /**
     * Sucht eine Karte nach exaktem deutschen Namen.
     * Optional<T> ist Java's Alternative zu nullable-Types in C#.
     * Statt "null" zurückzugeben: Optional.empty() oder Optional.of(card).
     */
    public Optional<Card> findByName(String name) {
        return dataLoader.getCards().stream()
                .filter(card -> card.getName().equalsIgnoreCase(name))
                .findFirst();
    }

    /**
     * Gibt alle Karten einer bestimmten Gruppe zurück (z.B. "Große Arkana", "Kelche").
     */
    public List<Card> findBySuit(String suit) {
        return dataLoader.getCards().stream()
                .filter(card -> card.getSuit().equalsIgnoreCase(suit))
                .collect(Collectors.toList());
    }

    /**
     * Volltextsuche im Namen (case-insensitive, enthält-Prüfung).
     * Entspricht: cards.Where(c => c.Name.Contains(query, StringComparison.OrdinalIgnoreCase))
     */
    public List<Card> searchByName(String query) {
        String lowerQuery = query.toLowerCase();
        return dataLoader.getCards().stream()
                .filter(card -> card.getName().toLowerCase().contains(lowerQuery))
                .collect(Collectors.toList());
    }

    /**
     * Gibt alle Karten mit einer bestimmten Kartennummer zurück (z.B. "0", "I", "2").
     */
    public List<Card> findByNumber(String number) {
        return dataLoader.getCards().stream()
                .filter(card -> card.getNumber().equalsIgnoreCase(number))
                .collect(Collectors.toList());
    }
}

