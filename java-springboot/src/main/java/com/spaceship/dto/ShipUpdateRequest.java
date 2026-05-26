package com.spaceship.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.spaceship.model.ShipClass;

public class ShipUpdateRequest {
    private String name;

    @JsonProperty("class")
    private ShipClass shipClass;

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

    public boolean isEmpty() {
        return name == null && shipClass == null && registry == null && warpCapable == null;
    }
}
