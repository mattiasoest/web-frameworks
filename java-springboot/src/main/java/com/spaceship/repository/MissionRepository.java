package com.spaceship.repository;

import com.spaceship.model.Mission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MissionRepository extends JpaRepository<Mission, UUID> {
    List<Mission> findByShipIdOrderByCreatedAtAsc(UUID shipId);
}
