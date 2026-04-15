package com.tarotapp.controller;

import com.tarotapp.model.Card;
import com.tarotapp.service.CardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST-Controller: Definiert die HTTP-Endpoints der API.
 * Entspricht einem [ApiController] in ASP.NET Core.
 *
 * @RestController  → Kombiniert @Controller + @ResponseBody
 *                    (Gibt automatisch JSON zurück, kein View-Rendering)
 * @RequestMapping  → Basis-Pfad für alle Methoden in dieser Klasse
 * @CrossOrigin     → Erlaubt Frontend (React auf Port 5173) den Zugriff
 *                    (wie CORS in ASP.NET Core Program.cs konfigurieren)
 */
@RestController
@RequestMapping("/api/cards")
@CrossOrigin(origins = "*")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    /**
     * GET /api/cards
     * GET /api/cards?suit=Große Arkana
     * GET /api/cards?search=Narr
     *
     * @RequestParam → wie [FromQuery] in ASP.NET Core
     * required=false → Parameter ist optional (hat Standardwert null)
     */
    @GetMapping
    public List<Card> getCards(
            @RequestParam(required = false) String suit,
            @RequestParam(required = false) String search) {

        if (search != null && !search.isBlank()) {
            return cardService.searchCards(search);
        }
        if (suit != null && !suit.isBlank()) {
            return cardService.getCardsBySuit(suit);
        }
        return cardService.getAllCards();
    }

    /**
     * GET /api/cards/suits
     * Gibt alle verfügbaren Gruppen zurück (z.B. "Große Arkana", "Kelche", ...)
     */
    @GetMapping("/suits")
    public List<String> getSuits() {
        return cardService.getAllSuits();
    }

    /**
     * GET /api/cards/{name}
     * z.B. GET /api/cards/Der Narr
     *
     * ResponseEntity<Card> entspricht ActionResult<Card> in ASP.NET Core.
     * Gibt 200 OK mit Karte zurück, oder 404 Not Found wenn nicht gefunden.
     */
    @GetMapping("/{name}")
    public ResponseEntity<Card> getCardByName(@PathVariable String name) {
        return cardService.getCardByName(name)
                .map(ResponseEntity::ok)                        // Optional ist vorhanden → 200 OK
                .orElse(ResponseEntity.notFound().build());      // Optional leer → 404 Not Found
    }
}

