package com.tarotapp.api;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Einheitliches JSON-Format fuer API-Fehler.
 */
@SuppressWarnings("unused")
@Schema(description = "Standardisiertes Fehlerobjekt fuer API-Responses")
public record ApiError(
        @Schema(description = "HTTP-Statuscode", example = "400")
        int status,
        @Schema(description = "Name des HTTP-Status", example = "BAD_REQUEST")
        String error,
        @Schema(description = "Fachlich lesbare Fehlermeldung", example = "Bitte genau einen Filter verwenden: 'suit', 'search' oder 'number'.")
        String message,
        @Schema(description = "Request-Pfad, auf dem der Fehler auftrat", example = "/api/cards")
        String path
) {
}


