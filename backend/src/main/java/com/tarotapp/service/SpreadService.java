package com.tarotapp.service;

import com.tarotapp.model.Spread;
import com.tarotapp.model.SpreadSummary;
import com.tarotapp.repository.SpreadRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service-Schicht fuer Legemuster.
 */
@Service
public class SpreadService {

    private final SpreadRepository spreadRepository;

    public SpreadService(SpreadRepository spreadRepository) {
        this.spreadRepository = spreadRepository;
    }

    public List<SpreadSummary> getAllSpreads() {
        return spreadRepository.findAll().stream()
                .map(spread -> new SpreadSummary(
                        spread.id(),
                        spread.name(),
                        spread.description(),
                        spread.positions().size(),
                        spread.tags()
                ))
                .toList();
    }

    public Optional<Spread> getSpreadById(String id) {
        return spreadRepository.findById(id);
    }
}

