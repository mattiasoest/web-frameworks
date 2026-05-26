package models

import (
	"time"

	"github.com/google/uuid"
)

type ShipClass string

const (
	ShipClassCruiser    ShipClass = "cruiser"
	ShipClassFrigate    ShipClass = "frigate"
	ShipClassDestroyer  ShipClass = "destroyer"
	ShipClassScout      ShipClass = "scout"
)

type CrewmateRole string

const (
	RoleCaptain  CrewmateRole = "captain"
	RoleEngineer CrewmateRole = "engineer"
	RoleMedic    CrewmateRole = "medic"
	RolePilot    CrewmateRole = "pilot"
	RoleGunner   CrewmateRole = "gunner"
)

type MissionStatus string

const (
	StatusPlanned   MissionStatus = "planned"
	StatusActive    MissionStatus = "active"
	StatusCompleted MissionStatus = "completed"
	StatusFailed    MissionStatus = "failed"
)

type Ship struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name        string    `gorm:"size:255;not null" json:"name"`
	Class       ShipClass `gorm:"column:class;type:ship_class;not null" json:"class"`
	Registry    string    `gorm:"size:255;not null;uniqueIndex" json:"registry"`
	WarpCapable bool      `gorm:"column:warp_capable;not null;default:false" json:"warp_capable"`
	CreatedAt   time.Time `gorm:"column:created_at;not null" json:"created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at;not null" json:"updated_at"`
}

func (Ship) TableName() string { return "ships" }

type Crewmate struct {
	ID        uuid.UUID    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ShipID    uuid.UUID    `gorm:"column:ship_id;type:uuid;not null" json:"ship_id"`
	Name      string       `gorm:"size:255;not null" json:"name"`
	Role      CrewmateRole `gorm:"type:crewmate_role;not null" json:"role"`
	Species   string       `gorm:"size:255;not null" json:"species"`
	Rank      int          `gorm:"column:rank;not null" json:"rank"`
	CreatedAt time.Time    `gorm:"column:created_at;not null" json:"created_at"`
	UpdatedAt time.Time    `gorm:"column:updated_at;not null" json:"updated_at"`
}

func (Crewmate) TableName() string { return "crewmates" }

type Mission struct {
	ID        uuid.UUID     `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ShipID    uuid.UUID     `gorm:"column:ship_id;type:uuid;not null" json:"ship_id"`
	Codename  string        `gorm:"size:255;not null" json:"codename"`
	Objective string        `gorm:"type:text;not null" json:"objective"`
	Status    MissionStatus `gorm:"type:mission_status;not null;default:planned" json:"status"`
	StartedAt *time.Time    `gorm:"column:started_at" json:"started_at"`
	EndedAt   *time.Time    `gorm:"column:ended_at" json:"ended_at"`
	CreatedAt time.Time     `gorm:"column:created_at;not null" json:"created_at"`
	UpdatedAt time.Time     `gorm:"column:updated_at;not null" json:"updated_at"`
}

func (Mission) TableName() string { return "missions" }
