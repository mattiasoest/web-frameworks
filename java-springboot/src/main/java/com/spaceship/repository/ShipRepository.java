package com.spaceship.repository;

import com.spaceship.model.Ship;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ShipRepository extends JpaRepository<Ship, UUID> {}
