package com.tarotapp.controller;

import com.tarotapp.api.ApiError;
import com.tarotapp.api.InterpretationResponse;
import com.tarotapp.model.Card;
import com.tarotapp.service.CardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * REST-Controller: Definiert die HTTP-Endpoints der API.
 * Entspricht einem [ApiController] in ASP.NET Core.
 * {@code @RestController} → Kombiniert {@code @Controller} + {@code @ResponseBody}
 * (gibt automatisch JSON zurück, kein View-Rendering).
 * {@code @RequestMapping} → Basis-Pfad für alle Methoden in dieser Klasse.
 * CORS wird zentral in `WebConfig` konfiguriert.
 * {@code @Tag} → Swagger UI Gruppierung (wie [ApiExplorerSettings] in ASP.NET Core).
 */
@RestController
@RequestMapping("/api/cards")
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
     * GET /api/cards?number=I
     */
    @Operation(
        summary = "Karten abrufen",
        description = "Gibt alle Karten zurück. Optional ist genau einer dieser Filter erlaubt: 'suit' (z.B. 'Große Arkana', 'Kelche'), 'search' (Namenssuche) oder 'number' (z.B. '0', 'I', '2')."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Karten erfolgreich geladen"),
            @ApiResponse(
                    responseCode = "400",
                    description = "Ungueltige Filterkombination",
                    content = @Content(schema = @Schema(implementation = ApiError.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Unerwarteter Serverfehler",
                    content = @Content(schema = @Schema(implementation = ApiError.class))
            )
    })
    @GetMapping
    public List<Card> getCards(
            @Parameter(description = "Gruppe filtern, z.B. 'Große Arkana', 'Kelche', 'Stäbe', 'Schwerter', 'Münzen'")
            @RequestParam(required = false) String suit,
            @Parameter(description = "Volltextsuche im Kartennamen, z.B. 'Narr'")
            @RequestParam(required = false) String search,
            @Parameter(description = "Kartennummer filtern, z.B. '0', 'I', '2', '14'")
            @RequestParam(required = false) String number) {

        boolean hasSuit = suit != null && !suit.isBlank();
        boolean hasSearch = search != null && !search.isBlank();
        boolean hasNumber = number != null && !number.isBlank();
        int activeFilterCount = (hasSuit ? 1 : 0) + (hasSearch ? 1 : 0) + (hasNumber ? 1 : 0);

        if (activeFilterCount > 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Bitte genau einen Filter verwenden: 'suit', 'search' oder 'number'."
            );
        }

        if (hasSearch) {
            return cardService.searchCards(search);
        }
        if (hasSuit) {
            return cardService.getCardsBySuit(suit);
        }
        if (hasNumber) {
            return cardService.getCardsByNumber(number);
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
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Suits erfolgreich geladen"),
            @ApiResponse(
                    responseCode = "500",
                    description = "Unerwarteter Serverfehler",
                    content = @Content(schema = @Schema(implementation = ApiError.class))
            )
    })
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
        @ApiResponse(
                responseCode = "404",
                description = "Keine Karte mit diesem Namen gefunden",
                content = @Content(schema = @Schema(implementation = ApiError.class))
        ),
        @ApiResponse(
                responseCode = "500",
                description = "Unerwarteter Serverfehler",
                content = @Content(schema = @Schema(implementation = ApiError.class))
        )
    })
    @GetMapping("/{name}")
    public ResponseEntity<Card> getCardByName(
            @Parameter(description = "Deutscher Kartenname, z.B. 'Der Magier'")
            @PathVariable String name) {
        return cardService.getCardByName(name)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Keine Karte mit diesem Namen gefunden."
                ));
    }

    /**
     * GET /api/cards/{name}/interpretation?orientation=upright
     * GET /api/cards/{name}/interpretation?orientation=reversed
     */
    @Operation(
            summary = "Interpretation einer Karte abrufen",
            description = "Gibt die orientierungsabhaengige Interpretation einer Karte zurueck. " +
                    "orientation: 'upright' (aufrecht) oder 'reversed' (umgekehrt). " +
                    "Standard ist 'upright' wenn nicht angegeben."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Interpretation erfolgreich geladen"),
            @ApiResponse(
                    responseCode = "404",
                    description = "Keine Karte mit diesem Namen gefunden",
                    content = @Content(schema = @Schema(implementation = ApiError.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Unerwarteter Serverfehler",
                    content = @Content(schema = @Schema(implementation = ApiError.class))
            )
    })
    @GetMapping("/{name}/interpretation")
    public InterpretationResponse getInterpretation(
            @Parameter(description = "Deutscher Kartenname, z.B. 'Der Narr'")
            @PathVariable String name,
            @Parameter(description = "Orientierung: 'upright' (Standard) oder 'reversed'")
            @RequestParam(required = false, defaultValue = "upright") String orientation) {
        return cardService.getInterpretation(name, orientation)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Keine Karte mit diesem Namen gefunden."
                ));
    }
}
