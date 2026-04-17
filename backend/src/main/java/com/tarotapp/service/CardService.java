package com.tarotapp.service;

import com.tarotapp.model.Card;
import com.tarotapp.repository.CardRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Business-Logic-Schicht für Kartenverwaltung.
 * Liegt zwischen Controller und Repository (klassisches 3-Schichten-Modell).
 * {@code @Service} -> Spring registriert diese Klasse als Service-Bean
 * In C# wäre das ein [Service]-annotierter oder ICardService-implementierender Klasse.
 */
@Service
public class CardService {

    private final CardRepository cardRepository;

    // Konstruktor-Injektion: Spring gibt das Repository automatisch mit
    public CardService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    /**
     * Alle Karten laden.
     */
    public List<Card> getAllCards() {
        return cardRepository.findAll();
    }

    /**
     * Karte nach Namen suchen. Gibt Optional zurück (nie null).
     */
    public Optional<Card> getCardByName(String name) {
        return cardRepository.findByName(name);
    }

    /**
     * Alle Karten einer Gruppe (Suit) laden.
     */
    public List<Card> getCardsBySuit(String suit) {
        return cardRepository.findBySuit(suit);
    }

    /**
     * Volltextsuche im Kartennamen.
     */
    public List<Card> searchCards(String query) {
        return cardRepository.searchByName(query);
    }

    /**
     * Alle Karten mit einer bestimmten Kartennummer laden.
     */
    public List<Card> getCardsByNumber(String number) {
        return cardRepository.findByNumber(number);
    }

    /**
     * Gibt alle eindeutigen Suits (Gruppen) zurück.
     * Java Streams: .map().distinct().sorted() → wie LINQ .Select().Distinct().OrderBy()
     */
    public List<String> getAllSuits() {
        return cardRepository.findAll().stream()
                .map(Card::getSuit)
                .distinct()
                .sorted()
                .toList();
    }
}

