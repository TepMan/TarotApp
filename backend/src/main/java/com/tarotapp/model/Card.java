package com.tarotapp.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

/**
 * Repräsentiert eine Tarot-Karte mit allen Beschreibungsfeldern.
 * Entspricht einem C# Record oder DTO-Klasse.
 *
 * Jackson deserialisiert das JSON automatisch in diese Klasse
 * (wie JsonConvert.DeserializeObject in C#).
 *
 * Das Feld "imageFile" wird NICHT im JSON gespeichert, sondern
 * nachträglich vom CardRepository gesetzt (Mapping über ImageAssertion).
 */
public class Card {

    // Jackson mappt JSON-Felder automatisch auf gleichnamige Felder
    // Bei abweichenden Namen: @JsonProperty("json_feldname")
    private String name;
    private String suit;
    private String number;
    private String kernbotschaft;

    @JsonProperty("psychologisch_aufrecht")
    private String psychologischAufrecht;

    @JsonProperty("psychologisch_umgekehrt")
    private String psychologischUmgekehrt;

    // Verschachteltes JSON-Objekt → Map<String, String>
    // (emotionen, beziehungen, beruf, entwicklung)
    private Map<String, String> anwendungsfelder;

    private String archetyp;

    // Wird NICHT aus JSON geladen – wird nachträglich gesetzt
    // (Entspricht einem [JsonIgnore] Property in C#)
    private String imageFile;
    private String imagePath;

    // --- Getter und Setter (Java-Konvention, kein C#-Property-Syntax) ---

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSuit() { return suit; }
    public void setSuit(String suit) { this.suit = suit; }

    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }

    public String getKernbotschaft() { return kernbotschaft; }
    public void setKernbotschaft(String kernbotschaft) { this.kernbotschaft = kernbotschaft; }

    public String getPsychologischAufrecht() { return psychologischAufrecht; }
    public void setPsychologischAufrecht(String psychologischAufrecht) { this.psychologischAufrecht = psychologischAufrecht; }

    public String getPsychologischUmgekehrt() { return psychologischUmgekehrt; }
    public void setPsychologischUmgekehrt(String psychologischUmgekehrt) { this.psychologischUmgekehrt = psychologischUmgekehrt; }

    public Map<String, String> getAnwendungsfelder() { return anwendungsfelder; }
    public void setAnwendungsfelder(Map<String, String> anwendungsfelder) { this.anwendungsfelder = anwendungsfelder; }

    public String getArchetyp() { return archetyp; }
    public void setArchetyp(String archetyp) { this.archetyp = archetyp; }

    public String getImageFile() { return imageFile; }
    public void setImageFile(String imageFile) { this.imageFile = imageFile; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    @Override
    public String toString() {
        return "Card{name='" + name + "', suit='" + suit + "', number='" + number + "'}";
    }
}

