package com.tarotapp.model;

/**
 * Beschreibt eine einzelne Position innerhalb eines Legemusters.
 * Jackson deserialisiert Records ab Version 2.12 automatisch per Feldnamen.
 */
public record SpreadPosition(
        int index,
        String key,
        String label,
        String prompt,
        int layoutX,
        int layoutY
) {
}

