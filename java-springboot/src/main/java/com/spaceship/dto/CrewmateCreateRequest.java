package com.spaceship.dto;

import com.spaceship.model.CrewmateRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class CrewmateCreateRequest {
    @NotNull
    private UUID shipId;

    @NotBlank
    private String name;

    @NotNull
    private CrewmateRole role;

    @NotBlank
    private String species;

    @NotNull
    private Integer rank;

    public UUID getShipId() { return shipId; }
    public void setShipId(UUID shipId) { this.shipId = shipId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public CrewmateRole getRole() { return role; }
    public void setRole(CrewmateRole role) { this.role = role; }
    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }
    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }
}
