package com.tarotapp.controller;

import com.tarotapp.model.Spread;
import com.tarotapp.model.SpreadPosition;
import com.tarotapp.model.SpreadSummary;
import com.tarotapp.service.SpreadService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SpreadController.class)
class SpreadControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SpreadService spreadService;

    @Test
    void shouldReturnSpreadSummaries() throws Exception {
        List<SpreadSummary> spreads = List.of(
                new SpreadSummary("three-card", "3-Karten Legung", "Kurzlegung", 3, List.of("einsteiger")),
                new SpreadSummary("cross-5", "5er Kreuz", "Analyse", 5, List.of("standard"))
        );
        when(spreadService.getAllSpreads()).thenReturn(spreads);

        mockMvc.perform(get("/api/spreads"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id").value("three-card"))
                .andExpect(jsonPath("$[0].positionCount").value(3))
                .andExpect(jsonPath("$[1].id").value("cross-5"));

        verify(spreadService).getAllSpreads();
        verifyNoMoreInteractions(spreadService);
    }

    @Test
    void shouldReturnSpreadDetailsById() throws Exception {
        Spread spread = new Spread(
                "three-card",
                "3-Karten Legung",
                "Kurzlegung",
                List.of("einsteiger"),
                List.of(
                        new SpreadPosition(1, "past", "Vergangenheit", "Was wirkt nach?", 0, 0),
                        new SpreadPosition(2, "present", "Gegenwart", "Was ist wichtig?", 1, 0),
                        new SpreadPosition(3, "future", "Tendenz", "Wohin geht es?", 2, 0)
                )
        );
        when(spreadService.getSpreadById("three-card")).thenReturn(Optional.of(spread));

        mockMvc.perform(get("/api/spreads/three-card"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("three-card"))
                .andExpect(jsonPath("$.positions", hasSize(3)))
                .andExpect(jsonPath("$.positions[0].key").value("past"));

        verify(spreadService).getSpreadById("three-card");
        verifyNoMoreInteractions(spreadService);
    }

    @Test
    void shouldReturnNotFoundErrorJsonWhenSpreadDoesNotExist() throws Exception {
        when(spreadService.getSpreadById("unknown")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/spreads/unknown"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Kein Legemuster mit dieser ID gefunden."))
                .andExpect(jsonPath("$.path").value("/api/spreads/unknown"));

        verify(spreadService).getSpreadById("unknown");
        verifyNoMoreInteractions(spreadService);
    }
}

