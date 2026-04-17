package com.tarotapp.controller;

import com.tarotapp.api.InterpretationResponse;
import com.tarotapp.model.Card;
import com.tarotapp.service.CardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CardController.class)
class CardControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CardService cardService;

    @Test
    void shouldReturnBadRequestWhenSuitAndSearchAreProvided() throws Exception {
        mockMvc.perform(get("/api/cards")
                        .param("suit", "Kelche")
                        .param("search", "Narr"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.message").value("Bitte genau einen Filter verwenden: 'suit', 'search' oder 'number'."))
                .andExpect(jsonPath("$.path").value("/api/cards"));

        verifyNoInteractions(cardService);
    }

    @Test
    void shouldReturnBadRequestWhenSuitAndNumberAreProvided() throws Exception {
        mockMvc.perform(get("/api/cards")
                        .param("suit", "Kelche")
                        .param("number", "1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.message").value("Bitte genau einen Filter verwenden: 'suit', 'search' oder 'number'."))
                .andExpect(jsonPath("$.path").value("/api/cards"));

        verifyNoInteractions(cardService);
    }

    @Test
    void shouldReturnBadRequestWhenSearchAndNumberAreProvided() throws Exception {
        mockMvc.perform(get("/api/cards")
                        .param("search", "Narr")
                        .param("number", "0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.message").value("Bitte genau einen Filter verwenden: 'suit', 'search' oder 'number'."))
                .andExpect(jsonPath("$.path").value("/api/cards"));

        verifyNoInteractions(cardService);
    }

    @Test
    void shouldReturnNotFoundErrorJsonWhenCardDoesNotExist() throws Exception {
        when(cardService.getCardByName("Unbekannt")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/cards/Unbekannt"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Keine Karte mit diesem Namen gefunden."))
                .andExpect(jsonPath("$.path").value("/api/cards/Unbekannt"));

        verify(cardService).getCardByName("Unbekannt");
        verifyNoMoreInteractions(cardService);
    }

    @Test
    void shouldReturnInternalServerErrorJsonWhenUnexpectedExceptionOccurs() throws Exception {
        when(cardService.getAllCards()).thenThrow(new IllegalStateException("boom"));

        mockMvc.perform(get("/api/cards").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.error").value("INTERNAL_SERVER_ERROR"))
                .andExpect(jsonPath("$.message").value("Ein unerwarteter Fehler ist aufgetreten."))
                .andExpect(jsonPath("$.path").value("/api/cards"));

        verify(cardService).getAllCards();
        verifyNoMoreInteractions(cardService);
    }

    @Test
    void shouldReturnAllCardsWhenNoFilterIsProvided() throws Exception {
        List<Card> cards = List.of(
                createCard("Der Narr", "Große Arkana", "0"),
                createCard("Der Magier", "Große Arkana", "I")
        );
        when(cardService.getAllCards()).thenReturn(cards);

        mockMvc.perform(get("/api/cards"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("Der Narr"))
                .andExpect(jsonPath("$[1].name").value("Der Magier"));

        verify(cardService).getAllCards();
        verifyNoMoreInteractions(cardService);
    }

    @Test
    void shouldReturnCardsBySuitWhenSuitIsProvided() throws Exception {
        List<Card> cards = List.of(createCard("Ass der Kelche", "Kelche", "1"));
        when(cardService.getCardsBySuit("Kelche")).thenReturn(cards);

        mockMvc.perform(get("/api/cards").param("suit", "Kelche"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].suit").value("Kelche"));

        verify(cardService).getCardsBySuit("Kelche");
        verifyNoMoreInteractions(cardService);
    }

    @Test
    void shouldReturnCardsBySearchWhenSearchIsProvided() throws Exception {
        List<Card> cards = List.of(createCard("Der Narr", "Große Arkana", "0"));
        when(cardService.searchCards("Narr")).thenReturn(cards);

        mockMvc.perform(get("/api/cards").param("search", "Narr"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Der Narr"));

        verify(cardService).searchCards("Narr");
        verifyNoMoreInteractions(cardService);
    }

    @Test
    void shouldReturnCardsByNumberWhenNumberIsProvided() throws Exception {
        List<Card> cards = List.of(createCard("Der Magier", "Große Arkana", "I"));
        when(cardService.getCardsByNumber("I")).thenReturn(cards);

        mockMvc.perform(get("/api/cards").param("number", "I"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].number").value("I"));

        verify(cardService).getCardsByNumber("I");
        verifyNoMoreInteractions(cardService);
    }

    @Test
    void shouldTreatBlankFiltersAsNotSet() throws Exception {
        List<Card> cards = List.of(createCard("Der Narr", "Große Arkana", "0"));
        when(cardService.getAllCards()).thenReturn(cards);

        mockMvc.perform(get("/api/cards")
                        .param("suit", "   ")
                        .param("search", "")
                        .param("number", "   "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Der Narr"));

        verify(cardService).getAllCards();
        verifyNoMoreInteractions(cardService);
    }

    private Card createCard(String name, String suit, String number) {
        Card card = new Card();
        card.setName(name);
        card.setSuit(suit);
        card.setNumber(number);
        return card;
    }

    @Test
    void shouldReturnUprightInterpretationByDefault() throws Exception {
        var interpretation = new InterpretationResponse(
                "Der Narr", "Große Arkana", "0", "upright",
                "Neubeginn und Offenheit", "Unvoreingenommene Neugier",
                java.util.Map.of("beruf", "Start neuer Projekte"),
                "Der Suchende", "00_Fool.jpg", "/images/00_Fool.jpg"
        );
        when(cardService.getInterpretation("Der Narr", "upright")).thenReturn(java.util.Optional.of(interpretation));

        mockMvc.perform(get("/api/cards/Der Narr/interpretation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Der Narr"))
                .andExpect(jsonPath("$.orientation").value("upright"))
                .andExpect(jsonPath("$.psychologie").value("Unvoreingenommene Neugier"));

        verify(cardService).getInterpretation("Der Narr", "upright");
        verifyNoMoreInteractions(cardService);
    }

    @Test
    void shouldReturnReversedInterpretation() throws Exception {
        var interpretation = new InterpretationResponse(
                "Der Narr", "Große Arkana", "0", "reversed",
                "Neubeginn und Offenheit", "Impulsivitaet und Naivitaet",
                java.util.Map.of("beruf", "Fehlende Vorbereitung"),
                "Der Suchende", "00_Fool.jpg", "/images/00_Fool.jpg"
        );
        when(cardService.getInterpretation("Der Narr", "reversed")).thenReturn(java.util.Optional.of(interpretation));

        mockMvc.perform(get("/api/cards/Der Narr/interpretation").param("orientation", "reversed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orientation").value("reversed"))
                .andExpect(jsonPath("$.psychologie").value("Impulsivitaet und Naivitaet"));

        verify(cardService).getInterpretation("Der Narr", "reversed");
        verifyNoMoreInteractions(cardService);
    }

    @Test
    void shouldReturnNotFoundForUnknownCardInterpretation() throws Exception {
        when(cardService.getInterpretation("Unbekannt", "upright")).thenReturn(java.util.Optional.empty());

        mockMvc.perform(get("/api/cards/Unbekannt/interpretation"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));

        verify(cardService).getInterpretation("Unbekannt", "upright");
        verifyNoMoreInteractions(cardService);
    }
}

