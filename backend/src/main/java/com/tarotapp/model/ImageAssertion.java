package com.tarotapp.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Repräsentiert einen Eintrag aus der images_assertions.json.
 * Verknüpft den deutschen Kartennamen mit dem Bild-Dateinamen.
 */
public class ImageAssertion {

    @JsonProperty("card_index")
    private int cardIndex;

    @JsonProperty("german_name")
    private String germanName;

    @JsonProperty("image_file")
    private String imageFile;

    @JsonProperty("image_path")
    private String imagePath;

    // --- Getter und Setter ---

    public int getCardIndex() { return cardIndex; }
    public void setCardIndex(int cardIndex) { this.cardIndex = cardIndex; }

    public String getGermanName() { return germanName; }
    public void setGermanName(String germanName) { this.germanName = germanName; }

    public String getImageFile() { return imageFile; }
    public void setImageFile(String imageFile) { this.imageFile = imageFile; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }
}

