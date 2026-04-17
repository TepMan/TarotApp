package com.tarotapp.controller;

import com.tarotapp.api.ApiError;
import com.tarotapp.model.Spread;
import com.tarotapp.model.SpreadSummary;
import com.tarotapp.service.SpreadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Read-only API fuer Legemuster und deren Positionen.
 */
@RestController
@RequestMapping("/api/spreads")
@Tag(name = "Legemuster", description = "Legemuster inkl. Positionen fuer die Kartenlegung")
public class SpreadController {

    private final SpreadService spreadService;

    public SpreadController(SpreadService spreadService) {
        this.spreadService = spreadService;
    }

    @Operation(
            summary = "Legemuster auflisten",
            description = "Gibt alle verfuegbaren Legemuster als kompakte Liste zurueck."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Legemuster erfolgreich geladen"),
            @ApiResponse(
                    responseCode = "500",
                    description = "Unerwarteter Serverfehler",
                    content = @Content(schema = @Schema(implementation = ApiError.class))
            )
    })
    @GetMapping
    public List<SpreadSummary> getSpreads() {
        return spreadService.getAllSpreads();
    }

    @Operation(
            summary = "Legemuster-Details laden",
            description = "Gibt ein Legemuster inklusive aller Positionen anhand der Spread-ID zurueck."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Legemuster gefunden"),
            @ApiResponse(
                    responseCode = "404",
                    description = "Kein Legemuster mit dieser ID gefunden",
                    content = @Content(schema = @Schema(implementation = ApiError.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Unerwarteter Serverfehler",
                    content = @Content(schema = @Schema(implementation = ApiError.class))
            )
    })
    @GetMapping("/{id}")
    public Spread getSpreadById(
            @Parameter(description = "Spread-ID, z.B. 'three-card'")
            @PathVariable String id) {
        return spreadService.getSpreadById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Kein Legemuster mit dieser ID gefunden."
                ));
    }
}

