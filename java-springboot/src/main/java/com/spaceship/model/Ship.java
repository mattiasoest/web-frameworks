package com.spaceship.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ships")
public class Ship {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "class", nullable = false, columnDefinition = "ship_class")
    @JsonProperty("class")
    private ShipClass shipClass;

    @Column(nullable = false, unique = true)
    private String registry;

    @Column(name = "warp_capable", nullable = false)
    private boolean warpCapable;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public ShipClass getShipClass() { return shipClass; }
    public void setShipClass(ShipClass shipClass) { this.shipClass = shipClass; }
    public String getRegistry() { return registry; }
    public void setRegistry(String registry) { this.registry = registry; }
    public boolean isWarpCapable() { return warpCapable; }
    public void setWarpCapable(boolean warpCapable) { this.warpCapable = warpCapable; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
