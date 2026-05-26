package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/rest-comparison/go-gin/internal/models"
)

type ErrorDetail struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type ErrorResponse struct {
	Error   string        `json:"error"`
	Details []ErrorDetail `json:"details,omitempty"`
}

type ShipCreateRequest struct {
	Name        string           `json:"name" validate:"required"`
	Class       models.ShipClass `json:"class" validate:"required,oneof=cruiser frigate destroyer scout"`
	Registry    string           `json:"registry" validate:"required"`
	WarpCapable *bool            `json:"warp_capable"`
}

type ShipUpdateRequest struct {
	Name        *string           `json:"name" validate:"omitempty,min=1"`
	Class       *models.ShipClass `json:"class" validate:"omitempty,oneof=cruiser frigate destroyer scout"`
	Registry    *string           `json:"registry" validate:"omitempty,min=1"`
	WarpCapable *bool             `json:"warp_capable"`
}

type CrewmateCreateRequest struct {
	ShipID  uuid.UUID          `json:"ship_id" validate:"required"`
	Name    string             `json:"name" validate:"required"`
	Role    models.CrewmateRole `json:"role" validate:"required,oneof=captain engineer medic pilot gunner"`
	Species string             `json:"species" validate:"required"`
	Rank    int                `json:"rank" validate:"required"`
}

type CrewmateUpdateRequest struct {
	ShipID  *uuid.UUID          `json:"ship_id"`
	Name    *string             `json:"name" validate:"omitempty,min=1"`
	Role    *models.CrewmateRole `json:"role" validate:"omitempty,oneof=captain engineer medic pilot gunner"`
	Species *string             `json:"species" validate:"omitempty,min=1"`
	Rank    *int                `json:"rank"`
}

type MissionCreateRequest struct {
	ShipID    uuid.UUID            `json:"ship_id" validate:"required"`
	Codename  string               `json:"codename" validate:"required"`
	Objective string               `json:"objective" validate:"required"`
	Status    *models.MissionStatus `json:"status" validate:"omitempty,oneof=planned active completed failed"`
	StartedAt *time.Time           `json:"started_at"`
	EndedAt   *time.Time           `json:"ended_at"`
}

type MissionUpdateRequest struct {
	ShipID    *uuid.UUID            `json:"ship_id"`
	Codename  *string               `json:"codename" validate:"omitempty,min=1"`
	Objective *string               `json:"objective" validate:"omitempty,min=1"`
	Status    *models.MissionStatus `json:"status" validate:"omitempty,oneof=planned active completed failed"`
	StartedAt *time.Time            `json:"started_at"`
	EndedAt   *time.Time            `json:"ended_at"`
}
