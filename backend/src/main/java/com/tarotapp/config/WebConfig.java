package com.tarotapp.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.List;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Web-Konfiguration für CORS und statische Ressourcen.
 * Entspricht app.UseCors() + app.UseStaticFiles() in ASP.NET Core.
 * {@code @Configuration} -> Spring behandelt diese Klasse als Konfigurationsquelle
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebConfig.class);

    /**
     * Registriert den Handler für Karten-Bilder.
     * Die Bilder liegen im /static/card_images/ Ordner des Projekts,
     * werden aber unter /images/** im Browser erreichbar.
     * Beispiel: GET /images/00_Fool.jpg
     *   → liefert die Datei aus ../static/card_images/720px/00_Fool.jpg
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Je nach Startverzeichnis ist entweder ./static/... oder ../static/... korrekt.
        List<String> imageLocations = new ArrayList<>();

        Path localStaticPath = Paths.get("static/card_images/720px").toAbsolutePath().normalize();
        Path parentStaticPath = Paths.get("../static/card_images/720px").toAbsolutePath().normalize();

        imageLocations.add("file:" + localStaticPath + "/");
        imageLocations.add("file:" + parentStaticPath + "/");

        logger.info("Image resource locations registriert: {}", imageLocations);

        registry.addResourceHandler("/images/**")
                .addResourceLocations(imageLocations.toArray(new String[0]));
    }

    /**
     * Globale CORS-Konfiguration für alle API-Endpunkte.
     * Erlaubt dem React-Frontend (normalerweise Port 5173 oder 3000) den Zugriff.
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}

