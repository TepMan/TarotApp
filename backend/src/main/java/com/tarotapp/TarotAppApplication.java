package com.tarotapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Einstiegspunkt der Spring Boot Anwendung.
 * Entspricht dem "Program.cs" mit builder.Build().Run() in ASP.NET Core.
 *
 * @SpringBootApplication kombiniert:
 *   - @Configuration        (wie Startup.cs ConfigureServices)
 *   - @EnableAutoConfiguration (automatisches Wiring von Komponenten)
 *   - @ComponentScan        (findet alle @Component, @Service, @Controller im Package)
 */
@SpringBootApplication
public class TarotAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(TarotAppApplication.class, args);
    }
}

