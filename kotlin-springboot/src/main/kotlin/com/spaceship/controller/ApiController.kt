package com.spaceship.controller

import com.spaceship.dto.*
import com.spaceship.exception.ResourceNotFoundException
import com.spaceship.exception.ValidationException
import com.spaceship.model.*
import com.spaceship.repository.CrewmateRepository
import com.spaceship.repository.MissionRepository
import com.spaceship.repository.ShipRepository
import jakarta.validation.Valid
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.util.UUID

@RestController
class ApiController(
    private val shipRepository: ShipRepository,
    private val crewmateRepository: CrewmateRepository,
    private val missionRepository: MissionRepository
) {
    @GetMapping("/healthz")
    fun healthz() = mapOf("status" to "ok")

    @GetMapping("/ships")
    fun listShips() = shipRepository.findAll()

    @PostMapping("/ships")
    fun createShip(@Valid @RequestBody request: ShipCreateRequest): ResponseEntity<Ship> {
        val now = Instant.now()
        val ship = Ship(
            name = request.name,
            shipClass = request.shipClass,
            registry = request.registry,
            warpCapable = request.warpCapable ?: false,
            createdAt = now,
            updatedAt = now
        )
        return try {
            ResponseEntity.status(HttpStatus.CREATED).body(shipRepository.save(ship))
        } catch (_: DataIntegrityViolationException) {
            throw validation("registry", "Registry must be unique")
        }
    }

    @GetMapping("/ships/{id}")
    fun getShip(@PathVariable id: UUID) =
        shipRepository.findById(id).orElseThrow { ResourceNotFoundException() }

    @PatchMapping("/ships/{id}")
    fun updateShip(@PathVariable id: UUID, @RequestBody request: ShipUpdateRequest): Ship {
        if (request.isEmpty()) throw validation("body", "At least one field is required")
        val ship = shipRepository.findById(id).orElseThrow { ResourceNotFoundException() }
        request.name?.let { ship.name = it }
        request.shipClass?.let { ship.shipClass = it }
        request.registry?.let { ship.registry = it }
        request.warpCapable?.let { ship.warpCapable = it }
        ship.updatedAt = Instant.now()
        return try {
            shipRepository.save(ship)
        } catch (_: DataIntegrityViolationException) {
            throw validation("registry", "Registry must be unique")
        }
    }

    @DeleteMapping("/ships/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteShip(@PathVariable id: UUID) {
        if (!shipRepository.existsById(id)) throw ResourceNotFoundException()
        shipRepository.deleteById(id)
    }

    @GetMapping("/ships/{id}/crewmates")
    fun listShipCrewmates(@PathVariable id: UUID): List<Crewmate> {
        if (!shipRepository.existsById(id)) throw ResourceNotFoundException()
        return crewmateRepository.findByShipIdOrderByRankAsc(id)
    }

    @GetMapping("/ships/{id}/missions")
    fun listShipMissions(@PathVariable id: UUID): List<Mission> {
        if (!shipRepository.existsById(id)) throw ResourceNotFoundException()
        return missionRepository.findByShipIdOrderByCreatedAtAsc(id)
    }

    @GetMapping("/crewmates")
    fun listCrewmates() = crewmateRepository.findAll()

    @PostMapping("/crewmates")
    fun createCrewmate(@Valid @RequestBody request: CrewmateCreateRequest): ResponseEntity<Crewmate> {
        val now = Instant.now()
        val crewmate = Crewmate(
            shipId = request.shipId,
            name = request.name,
            role = request.role,
            species = request.species,
            rank = request.rank,
            createdAt = now,
            updatedAt = now
        )
        return try {
            ResponseEntity.status(HttpStatus.CREATED).body(crewmateRepository.save(crewmate))
        } catch (_: DataIntegrityViolationException) {
            throw validation("ship_id", "Ship does not exist")
        }
    }

    @GetMapping("/crewmates/{id}")
    fun getCrewmate(@PathVariable id: UUID) =
        crewmateRepository.findById(id).orElseThrow { ResourceNotFoundException() }

    @PatchMapping("/crewmates/{id}")
    fun updateCrewmate(@PathVariable id: UUID, @RequestBody request: CrewmateUpdateRequest): Crewmate {
        if (request.isEmpty()) throw validation("body", "At least one field is required")
        val crewmate = crewmateRepository.findById(id).orElseThrow { ResourceNotFoundException() }
        request.shipId?.let { crewmate.shipId = it }
        request.name?.let { crewmate.name = it }
        request.role?.let { crewmate.role = it }
        request.species?.let { crewmate.species = it }
        request.rank?.let { crewmate.rank = it }
        crewmate.updatedAt = Instant.now()
        return try {
            crewmateRepository.save(crewmate)
        } catch (_: DataIntegrityViolationException) {
            throw validation("ship_id", "Ship does not exist")
        }
    }

    @DeleteMapping("/crewmates/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteCrewmate(@PathVariable id: UUID) {
        if (!crewmateRepository.existsById(id)) throw ResourceNotFoundException()
        crewmateRepository.deleteById(id)
    }

    @GetMapping("/missions")
    fun listMissions() = missionRepository.findAll()

    @PostMapping("/missions")
    fun createMission(@Valid @RequestBody request: MissionCreateRequest): ResponseEntity<Mission> {
        val now = Instant.now()
        val mission = Mission(
            shipId = request.shipId,
            codename = request.codename,
            objective = request.objective,
            status = request.status ?: MissionStatus.planned,
            startedAt = request.startedAt,
            endedAt = request.endedAt,
            createdAt = now,
            updatedAt = now
        )
        return try {
            ResponseEntity.status(HttpStatus.CREATED).body(missionRepository.save(mission))
        } catch (_: DataIntegrityViolationException) {
            throw validation("ship_id", "Ship does not exist")
        }
    }

    @GetMapping("/missions/{id}")
    fun getMission(@PathVariable id: UUID) =
        missionRepository.findById(id).orElseThrow { ResourceNotFoundException() }

    @PatchMapping("/missions/{id}")
    fun updateMission(@PathVariable id: UUID, @RequestBody request: MissionUpdateRequest): Mission {
        if (request.isEmpty()) throw validation("body", "At least one field is required")
        val mission = missionRepository.findById(id).orElseThrow { ResourceNotFoundException() }
        request.shipId?.let { mission.shipId = it }
        request.codename?.let { mission.codename = it }
        request.objective?.let { mission.objective = it }
        request.status?.let { mission.status = it }
        request.startedAt?.let { mission.startedAt = it }
        request.endedAt?.let { mission.endedAt = it }
        mission.updatedAt = Instant.now()
        return try {
            missionRepository.save(mission)
        } catch (_: DataIntegrityViolationException) {
            throw validation("ship_id", "Ship does not exist")
        }
    }

    @DeleteMapping("/missions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteMission(@PathVariable id: UUID) {
        if (!missionRepository.existsById(id)) throw ResourceNotFoundException()
        missionRepository.deleteById(id)
    }

    private fun validation(field: String, message: String): ValidationException =
        ValidationException(listOf(mapOf("field" to field, "message" to message)))
}
