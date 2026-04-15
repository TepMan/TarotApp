package com.tarotapp.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger UI Konfiguration.
 * SpringDoc scannt automatisch alle {@code @RestController} und generiert daraus
 * eine OpenAPI 3 Spezifikation – ähnlich wie Swashbuckle in ASP.NET Core.
 * Swagger UI: <a href="http://localhost:8080/swagger-ui.html">http://localhost:8080/swagger-ui.html</a>
 * OpenAPI JSON: <a href="http://localhost:8080/v3/api-docs">http://localhost:8080/v3/api-docs</a>
 */
@Configuration
public class OpenApiConfig {

    /**
     * {@code @Bean} → Spring verwaltet dieses Objekt im DI-Container
     * (wie {@code services.AddSingleton<>()} in ASP.NET Core)
     */
    @Bean
    public OpenAPI tarotOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("TarotApp API")
                        .description("REST API für die Tarot-Karten-Anwendung. " +
                                "Bietet Zugriff auf alle 78 Karten mit Beschreibungen und Bildern.")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("TarotApp")
                        )
                );
    }
}
