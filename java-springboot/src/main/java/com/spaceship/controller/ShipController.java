package com.spaceship.controller;

import com.spaceship.dto.*;
import com.spaceship.exception.ResourceNotFoundException;
import com.spaceship.exception.ValidationException;
import com.spaceship.model.*;
import com.spaceship.repository.CrewmateRepository;
import com.spaceship.repository.MissionRepository;
import com.spaceship.repository.ShipRepository;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
public class ShipController {
    private final ShipRepository shipRepository;
    private final CrewmateRepository crewmateRepository;
    private final MissionRepository missionRepository;

    public ShipController(ShipRepository shipRepository, CrewmateRepository crewmateRepository,
                          MissionRepository missionRepository) {
        this.shipRepository = shipRepository;
        this.crewmateRepository = crewmateRepository;
        this.missionRepository = missionRepository;
    }

    @GetMapping("/healthz")
    public Map<String, String> healthz() {
        return Map.of("status", "ok");
    }

    @GetMapping("/ships")
    public List<Ship> listShips() {
        return shipRepository.findAll();
    }

    @PostMapping("/ships")
    public ResponseEntity<Ship> createShip(@Valid @RequestBody ShipCreateRequest request) {
        Ship ship = new Ship();
        ship.setName(request.getName());
        ship.setShipClass(request.getShipClass());
        ship.setRegistry(request.getRegistry());
        ship.setWarpCapable(request.getWarpCapable() != null && request.getWarpCapable());
        Instant now = Instant.now();
        ship.setCreatedAt(now);
        ship.setUpdatedAt(now);
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(shipRepository.save(ship));
        } catch (DataIntegrityViolationException ex) {
            throw validation("registry", "Registry must be unique");
        }
    }

    @GetMapping("/ships/{id}")
    public Ship getShip(@PathVariable UUID id) {
        return shipRepository.findById(id).orElseThrow(ResourceNotFoundException::new);
    }

    @PatchMapping("/ships/{id}")
    public Ship updateShip(@PathVariable UUID id, @RequestBody ShipUpdateRequest request) {
        if (request.isEmpty()) {
            throw validation("body", "At least one field is required");
        }
        Ship ship = shipRepository.findById(id).orElseThrow(ResourceNotFoundException::new);
        if (request.getName() != null) ship.setName(request.getName());
        if (request.getShipClass() != null) ship.setShipClass(request.getShipClass());
        if (request.getRegistry() != null) ship.setRegistry(request.getRegistry());
        if (request.getWarpCapable() != null) ship.setWarpCapable(request.getWarpCapable());
        ship.setUpdatedAt(Instant.now());
        try {
            return shipRepository.save(ship);
        } catch (DataIntegrityViolationException ex) {
            throw validation("registry", "Registry must be unique");
        }
    }

    @DeleteMapping("/ships/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteShip(@PathVariable UUID id) {
        if (!shipRepository.existsById(id)) {
            throw new ResourceNotFoundException();
        }
        shipRepository.deleteById(id);
    }

    @GetMapping("/ships/{id}/crewmates")
    public List<Crewmate> listShipCrewmates(@PathVariable UUID id) {
        if (!shipRepository.existsById(id)) {
            throw new ResourceNotFoundException();
        }
        return crewmateRepository.findByShipIdOrderByRankAsc(id);
    }

    @GetMapping("/ships/{id}/missions")
    public List<Mission> listShipMissions(@PathVariable UUID id) {
        if (!shipRepository.existsById(id)) {
            throw new ResourceNotFoundException();
        }
        return missionRepository.findByShipIdOrderByCreatedAtAsc(id);
    }

    @GetMapping("/crewmates")
    public List<Crewmate> listCrewmates() {
        return crewmateRepository.findAll();
    }

    @PostMapping("/crewmates")
    public ResponseEntity<Crewmate> createCrewmate(@Valid @RequestBody CrewmateCreateRequest request) {
        Crewmate crewmate = new Crewmate();
        crewmate.setShipId(request.getShipId());
        crewmate.setName(request.getName());
        crewmate.setRole(request.getRole());
        crewmate.setSpecies(request.getSpecies());
        crewmate.setRank(request.getRank());
        Instant now = Instant.now();
        crewmate.setCreatedAt(now);
        crewmate.setUpdatedAt(now);
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(crewmateRepository.save(crewmate));
        } catch (DataIntegrityViolationException ex) {
            throw validation("ship_id", "Ship does not exist");
        }
    }

    @GetMapping("/crewmates/{id}")
    public Crewmate getCrewmate(@PathVariable UUID id) {
        return crewmateRepository.findById(id).orElseThrow(ResourceNotFoundException::new);
    }

    @PatchMapping("/crewmates/{id}")
    public Crewmate updateCrewmate(@PathVariable UUID id, @RequestBody CrewmateUpdateRequest request) {
        if (request.isEmpty()) {
            throw validation("body", "At least one field is required");
        }
        Crewmate crewmate = crewmateRepository.findById(id).orElseThrow(ResourceNotFoundException::new);
        if (request.getShipId() != null) crewmate.setShipId(request.getShipId());
        if (request.getName() != null) crewmate.setName(request.getName());
        if (request.getRole() != null) crewmate.setRole(request.getRole());
        if (request.getSpecies() != null) crewmate.setSpecies(request.getSpecies());
        if (request.getRank() != null) crewmate.setRank(request.getRank());
        crewmate.setUpdatedAt(Instant.now());
        try {
            return crewmateRepository.save(crewmate);
        } catch (DataIntegrityViolationException ex) {
            throw validation("ship_id", "Ship does not exist");
        }
    }

    @DeleteMapping("/crewmates/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCrewmate(@PathVariable UUID id) {
        if (!crewmateRepository.existsById(id)) {
            throw new ResourceNotFoundException();
        }
        crewmateRepository.deleteById(id);
    }

    @GetMapping("/missions")
    public List<Mission> listMissions() {
        return missionRepository.findAll();
    }

    @PostMapping("/missions")
    public ResponseEntity<Mission> createMission(@Valid @RequestBody MissionCreateRequest request) {
        Mission mission = new Mission();
        mission.setShipId(request.getShipId());
        mission.setCodename(request.getCodename());
        mission.setObjective(request.getObjective());
        mission.setStatus(request.getStatus() != null ? request.getStatus() : MissionStatus.planned);
        mission.setStartedAt(request.getStartedAt());
        mission.setEndedAt(request.getEndedAt());
        Instant now = Instant.now();
        mission.setCreatedAt(now);
        mission.setUpdatedAt(now);
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(missionRepository.save(mission));
        } catch (DataIntegrityViolationException ex) {
            throw validation("ship_id", "Ship does not exist");
        }
    }

    @GetMapping("/missions/{id}")
    public Mission getMission(@PathVariable UUID id) {
        return missionRepository.findById(id).orElseThrow(ResourceNotFoundException::new);
    }

    @PatchMapping("/missions/{id}")
    public Mission updateMission(@PathVariable UUID id, @RequestBody MissionUpdateRequest request) {
        if (request.isEmpty()) {
            throw validation("body", "At least one field is required");
        }
        Mission mission = missionRepository.findById(id).orElseThrow(ResourceNotFoundException::new);
        if (request.getShipId() != null) mission.setShipId(request.getShipId());
        if (request.getCodename() != null) mission.setCodename(request.getCodename());
        if (request.getObjective() != null) mission.setObjective(request.getObjective());
        if (request.getStatus() != null) mission.setStatus(request.getStatus());
        if (request.getStartedAt() != null) mission.setStartedAt(request.getStartedAt());
        if (request.getEndedAt() != null) mission.setEndedAt(request.getEndedAt());
        mission.setUpdatedAt(Instant.now());
        try {
            return missionRepository.save(mission);
        } catch (DataIntegrityViolationException ex) {
            throw validation("ship_id", "Ship does not exist");
        }
    }

    @DeleteMapping("/missions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMission(@PathVariable UUID id) {
        if (!missionRepository.existsById(id)) {
            throw new ResourceNotFoundException();
        }
        missionRepository.deleteById(id);
    }

    private ValidationException validation(String field, String message) {
        return new ValidationException(List.of(Map.of("field", field, "message", message)));
    }
}
