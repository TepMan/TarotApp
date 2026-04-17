package com.tarotapp.model;

import java.util.List;

/**
 * Kompakte Sicht auf ein Legemuster fuer Listenansichten.
 */
public record SpreadSummary(
        String id,
        String name,
        String description,
        int positionCount,
        List<String> tags
) {
}

