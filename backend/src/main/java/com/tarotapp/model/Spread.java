package com.tarotapp.model;

import java.util.List;

/**
 * Vollstaendiges Legemuster inklusive Positionen fuer Detailansichten.
 */
public record Spread(
        String id,
        String name,
        String description,
        List<String> tags,
        List<SpreadPosition> positions
) {
}

