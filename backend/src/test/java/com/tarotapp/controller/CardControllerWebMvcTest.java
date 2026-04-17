package com.tarotapp.controller;

import com.tarotapp.model.Card;
import com.tarotapp.service.CardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;

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
                .andExpect(status().isBadRequest());

        verifyNoInteractions(cardService);
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
    void shouldTreatBlankFiltersAsNotSet() throws Exception {
        List<Card> cards = List.of(createCard("Der Narr", "Große Arkana", "0"));
        when(cardService.getAllCards()).thenReturn(cards);

        mockMvc.perform(get("/api/cards")
                        .param("suit", "   ")
                        .param("search", ""))
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
}

