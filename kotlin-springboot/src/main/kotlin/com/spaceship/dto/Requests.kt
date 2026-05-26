package com.spaceship.dto

import com.fasterxml.jackson.annotation.JsonProperty
import com.spaceship.model.CrewmateRole
import com.spaceship.model.MissionStatus
import com.spaceship.model.ShipClass
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.Instant
import java.util.UUID

data class ShipCreateRequest(
    @field:NotBlank val name: String,
    @field:NotNull @field:JsonProperty("class") val shipClass: ShipClass,
    @field:NotBlank val registry: String,
    val warpCapable: Boolean? = null
)

data class ShipUpdateRequest(
    val name: String? = null,
    @field:JsonProperty("class") val shipClass: ShipClass? = null,
    val registry: String? = null,
    val warpCapable: Boolean? = null
) {
    fun isEmpty(): Boolean = name == null && shipClass == null && registry == null && warpCapable == null
}

data class CrewmateCreateRequest(
    @field:NotNull val shipId: UUID,
    @field:NotBlank val name: String,
    @field:NotNull val role: CrewmateRole,
    @field:NotBlank val species: String,
    @field:NotNull val rank: Int
)

data class CrewmateUpdateRequest(
    val shipId: UUID? = null,
    val name: String? = null,
    val role: CrewmateRole? = null,
    val species: String? = null,
    val rank: Int? = null
) {
    fun isEmpty(): Boolean = shipId == null && name == null && role == null && species == null && rank == null
}

data class MissionCreateRequest(
    @field:NotNull val shipId: UUID,
    @field:NotBlank val codename: String,
    @field:NotBlank val objective: String,
    val status: MissionStatus? = null,
    val startedAt: Instant? = null,
    val endedAt: Instant? = null
)

data class MissionUpdateRequest(
    val shipId: UUID? = null,
    val codename: String? = null,
    val objective: String? = null,
    val status: MissionStatus? = null,
    val startedAt: Instant? = null,
    val endedAt: Instant? = null
) {
    fun isEmpty(): Boolean =
        shipId == null && codename == null && objective == null && status == null && startedAt == null && endedAt == null
}
