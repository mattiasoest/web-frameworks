package com.spaceship.dto;

import com.spaceship.model.MissionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public class MissionCreateRequest {
    @NotNull
    private UUID shipId;

    @NotBlank
    private String codename;

    @NotBlank
    private String objective;

    private MissionStatus status;
    private Instant startedAt;
    private Instant endedAt;

    public UUID getShipId() { return shipId; }
    public void setShipId(UUID shipId) { this.shipId = shipId; }
    public String getCodename() { return codename; }
    public void setCodename(String codename) { this.codename = codename; }
    public String getObjective() { return objective; }
    public void setObjective(String objective) { this.objective = objective; }
    public MissionStatus getStatus() { return status; }
    public void setStatus(MissionStatus status) { this.status = status; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getEndedAt() { return endedAt; }
    public void setEndedAt(Instant endedAt) { this.endedAt = endedAt; }
}
