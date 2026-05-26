package com.spaceship.repository;

import com.spaceship.model.Crewmate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CrewmateRepository extends JpaRepository<Crewmate, UUID> {
    List<Crewmate> findByShipIdOrderByRankAsc(UUID shipId);
}
