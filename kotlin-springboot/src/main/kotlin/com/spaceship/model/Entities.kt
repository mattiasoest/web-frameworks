package com.spaceship.model

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "ships")
class Ship(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    var id: UUID? = null,

    @Column(nullable = false)
    var name: String = "",

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "class", nullable = false, columnDefinition = "ship_class")
    @get:JsonProperty("class")
    var shipClass: ShipClass = ShipClass.scout,

    @Column(nullable = false, unique = true)
    var registry: String = "",

    @Column(name = "warp_capable", nullable = false)
    var warpCapable: Boolean = false,

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)

@Entity
@Table(name = "crewmates")
class Crewmate(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    var id: UUID? = null,

    @Column(name = "ship_id", nullable = false, columnDefinition = "uuid")
    var shipId: UUID = UUID.randomUUID(),

    @Column(nullable = false)
    var name: String = "",

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "crewmate_role")
    var role: CrewmateRole = CrewmateRole.pilot,

    @Column(nullable = false)
    var species: String = "",

    @Column(name = "rank", nullable = false)
    var rank: Int = 0,

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)

@Entity
@Table(name = "missions")
class Mission(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    var id: UUID? = null,

    @Column(name = "ship_id", nullable = false, columnDefinition = "uuid")
    var shipId: UUID = UUID.randomUUID(),

    @Column(nullable = false)
    var codename: String = "",

    @Column(nullable = false, columnDefinition = "text")
    var objective: String = "",

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "mission_status")
    var status: MissionStatus = MissionStatus.planned,

    @Column(name = "started_at")
    var startedAt: Instant? = null,

    @Column(name = "ended_at")
    var endedAt: Instant? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)
