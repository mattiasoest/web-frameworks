package com.spaceship.repository

import com.spaceship.model.Crewmate
import com.spaceship.model.Mission
import com.spaceship.model.Ship
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ShipRepository : JpaRepository<Ship, UUID>

interface CrewmateRepository : JpaRepository<Crewmate, UUID> {
    fun findByShipIdOrderByRankAsc(shipId: UUID): List<Crewmate>
}

interface MissionRepository : JpaRepository<Mission, UUID> {
    fun findByShipIdOrderByCreatedAtAsc(shipId: UUID): List<Mission>
}
