package com.spaceship.dto;

import com.spaceship.model.CrewmateRole;

import java.util.UUID;

public class CrewmateUpdateRequest {
    private UUID shipId;
    private String name;
    private CrewmateRole role;
    private String species;
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

    public boolean isEmpty() {
        return shipId == null && name == null && role == null && species == null && rank == null;
    }
}
