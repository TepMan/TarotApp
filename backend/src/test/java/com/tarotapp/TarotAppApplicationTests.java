package com.tarotapp;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Grundlegender Smoketest: Prüft ob der Spring-Context fehlerfrei startet.
 * Entspricht einem WebApplicationFactory<Program>-Test in ASP.NET Core.
 */
@SpringBootTest
class TarotAppApplicationTests {

    @Test
    void contextLoads() {
        // Wenn Spring Boot startet und alle Beans korrekt verdrahtet sind,
        // gilt dieser Test als bestanden – kein weiterer Code nötig.
    }
}

