package com.tarotapp.controller;

import com.tarotapp.model.Card;
import com.tarotapp.service.CardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST-Controller: Definiert die HTTP-Endpoints der API.
 * Entspricht einem [ApiController] in ASP.NET Core.
 * {@code @RestController} → Kombiniert {@code @Controller} + {@code @ResponseBody}
 * (gibt automatisch JSON zurück, kein View-Rendering).
 * {@code @RequestMapping} → Basis-Pfad für alle Methoden in dieser Klasse.
 * {@code @CrossOrigin} → Erlaubt Frontend (React auf Port 5173) den Zugriff
 * (wie CORS in ASP.NET Core Program.cs konfigurieren).
 * {@code @Tag} → Swagger UI Gruppierung (wie [ApiExplorerSettings] in ASP.NET Core).
 */
@RestController
@RequestMapping("/api/cards")
@CrossOrigin(origins = "*")
@Tag(name = "Karten", description = "Zugriff auf alle 78 Tarot-Karten mit Beschreibungen und Bildzuordnungen")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    /**
     * GET /api/cards
     * GET /api/cards?suit=Große Arkana
     * GET /api/cards?search=Narr
     */
    @Operation(
        summary = "Karten abrufen",
        description = "Gibt alle Karten zurück. Optionale Filter: 'suit' für eine Gruppe (z.B. 'Große Arkana', 'Kelche') oder 'search' für eine Namenssuche."
    )
    @GetMapping
    public List<Card> getCards(
            @Parameter(description = "Gruppe filtern, z.B. 'Große Arkana', 'Kelche', 'Stäbe', 'Schwerter', 'Münzen'")
            @RequestParam(required = false) String suit,
            @Parameter(description = "Volltextsuche im Kartennamen, z.B. 'Narr'")
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
     */
    @Operation(
        summary = "Alle Gruppen abrufen",
        description = "Gibt eine sortierte Liste aller Kartengruppen (Suits) zurück."
    )
    @GetMapping("/suits")
    public List<String> getSuits() {
        return cardService.getAllSuits();
    }

    /**
     * GET /api/cards/{name}
     */
    @Operation(
        summary = "Einzelne Karte nach Name abrufen",
        description = "Gibt eine einzelne Karte anhand ihres deutschen Namens zurück, z.B. 'Der Narr'."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Karte gefunden"),
        @ApiResponse(responseCode = "404", description = "Keine Karte mit diesem Namen gefunden")
    })
    @GetMapping("/{name}")
    public ResponseEntity<Card> getCardByName(
            @Parameter(description = "Deutscher Kartenname, z.B. 'Der Magier'")
            @PathVariable String name) {
        return cardService.getCardByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
