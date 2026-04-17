package com.tarotapp.api;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.Map;

/**
 * Gibt die fuer eine Kartenlegung relevanten Interpretationsfelder zurueck.
 * Orientation-abhaengig wird entweder die aufrechte oder umgekehrte
 * psychologische Bedeutung ausgeliefert.
 */
@Schema(description = "Interpretation einer Tarot-Karte in einer konkreten Legungsposition")
public record InterpretationResponse(

        @Schema(description = "Deutscher Kartenname", example = "Der Narr")
        String name,

        @Schema(description = "Gruppe der Karte", example = "Große Arkana")
        String suit,

        @Schema(description = "Kartennummer", example = "0")
        String number,

        @Schema(description = "Orientierung: 'upright' oder 'reversed'", example = "upright")
        String orientation,

        @Schema(description = "Kernbotschaft der Karte")
        String kernbotschaft,

        @Schema(description = "Psychologische Bedeutung passend zur Orientierung")
        String psychologie,

        @Schema(description = "Anwendungsfelder (emotionen, beziehungen, beruf, entwicklung)")
        Map<String, String> anwendungsfelder,

        @Schema(description = "Archetypische Rolle der Karte", example = "Der Suchende")
        String archetyp,

        @Schema(description = "Dateiname des Kartenbildes", example = "00_Fool.jpg")
        String imageFile,

        @Schema(description = "Relativer Bildpfad", example = "/images/00_Fool.jpg")
        String imagePath
) {
}

