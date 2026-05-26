package com.spaceship.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "crewmates")
public class Crewmate {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "ship_id", nullable = false, columnDefinition = "uuid")
    private UUID shipId;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "crewmate_role")
    private CrewmateRole role;

    @Column(nullable = false)
    private String species;

    @Column(name = "rank", nullable = false)
    private int rank;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getShipId() { return shipId; }
    public void setShipId(UUID shipId) { this.shipId = shipId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public CrewmateRole getRole() { return role; }
    public void setRole(CrewmateRole role) { this.role = role; }
    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }
    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
