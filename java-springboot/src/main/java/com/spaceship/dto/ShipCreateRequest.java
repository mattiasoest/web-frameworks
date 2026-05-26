package com.spaceship.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.spaceship.model.ShipClass;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ShipCreateRequest {
    @NotBlank
    private String name;

    @NotNull
    @JsonProperty("class")
    private ShipClass shipClass;

    @NotBlank
    private String registry;

    private Boolean warpCapable;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public ShipClass getShipClass() { return shipClass; }
    public void setShipClass(ShipClass shipClass) { this.shipClass = shipClass; }
    public String getRegistry() { return registry; }
    public void setRegistry(String registry) { this.registry = registry; }
    public Boolean getWarpCapable() { return warpCapable; }
    public void setWarpCapable(Boolean warpCapable) { this.warpCapable = warpCapable; }
}
