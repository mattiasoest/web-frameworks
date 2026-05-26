package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/rest-comparison/go-gin/internal/dto"
	"github.com/rest-comparison/go-gin/internal/models"
	"gorm.io/gorm"
)

type Handler struct {
	DB       *gorm.DB
	Validate *validator.Validate
}

func New(db *gorm.DB) *Handler {
	return &Handler{DB: db, Validate: validator.New()}
}

func (h *Handler) RegisterRoutes(r *gin.Engine) {
	r.GET("/healthz", h.healthz)
	r.GET("/ships", h.listShips)
	r.POST("/ships", h.createShip)
	r.GET("/ships/:id", h.getShip)
	r.PATCH("/ships/:id", h.updateShip)
	r.DELETE("/ships/:id", h.deleteShip)
	r.GET("/ships/:id/crewmates", h.listShipCrewmates)
	r.GET("/ships/:id/missions", h.listShipMissions)

	r.GET("/crewmates", h.listCrewmates)
	r.POST("/crewmates", h.createCrewmate)
	r.GET("/crewmates/:id", h.getCrewmate)
	r.PATCH("/crewmates/:id", h.updateCrewmate)
	r.DELETE("/crewmates/:id", h.deleteCrewmate)

	r.GET("/missions", h.listMissions)
	r.POST("/missions", h.createMission)
	r.GET("/missions/:id", h.getMission)
	r.PATCH("/missions/:id", h.updateMission)
	r.DELETE("/missions/:id", h.deleteMission)
}

func (h *Handler) healthz(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func parseUUID(c *gin.Context, param string) (uuid.UUID, bool) {
	id, err := uuid.Parse(c.Param(param))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "validation_failed",
			Details: []dto.ErrorDetail{{
				Field:   "id",
				Message: "Invalid UUID",
			}},
		})
		return uuid.Nil, false
	}
	return id, true
}

func validationError(c *gin.Context, err error) {
	var ve validator.ValidationErrors
	if errors.As(err, &ve) {
		details := make([]dto.ErrorDetail, 0, len(ve))
		for _, fe := range ve {
			details = append(details, dto.ErrorDetail{
				Field:   strings.ToLower(fe.Field()),
				Message: fe.Error(),
			})
		}
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "validation_failed", Details: details})
		return
	}
	c.JSON(http.StatusBadRequest, dto.ErrorResponse{
		Error: "validation_failed",
		Details: []dto.ErrorDetail{{
			Field:   "body",
			Message: err.Error(),
		}},
	})
}

func isForeignKey(err error) bool {
	return strings.Contains(strings.ToLower(err.Error()), "foreign key")
}

func isUnique(err error) bool {
	return strings.Contains(strings.ToLower(err.Error()), "duplicate") ||
		strings.Contains(strings.ToLower(err.Error()), "unique")
}

func (h *Handler) listShips(c *gin.Context) {
	var ships []models.Ship
	if err := h.DB.Order("created_at asc").Find(&ships).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	c.JSON(http.StatusOK, ships)
}

func (h *Handler) createShip(c *gin.Context) {
	var req dto.ShipCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err)
		return
	}
	if err := h.Validate.Struct(req); err != nil {
		validationError(c, err)
		return
	}
	warp := false
	if req.WarpCapable != nil {
		warp = *req.WarpCapable
	}
	ship := models.Ship{
		Name:        req.Name,
		Class:       req.Class,
		Registry:    req.Registry,
		WarpCapable: warp,
	}
	if err := h.DB.Create(&ship).Error; err != nil {
		if isUnique(err) {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: "validation_failed",
				Details: []dto.ErrorDetail{{
					Field:   "registry",
					Message: "Registry must be unique",
				}},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	c.JSON(http.StatusCreated, ship)
}

func (h *Handler) getShip(c *gin.Context) {
	id, ok := parseUUID(c, "id")
	if !ok {
		return
	}
	var ship models.Ship
	if err := h.DB.First(&ship, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not_found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	c.JSON(http.StatusOK, ship)
}

func (h *Handler) updateShip(c *gin.Context) {
	id, ok := parseUUID(c, "id")
	if !ok {
		return
	}
	var req dto.ShipUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err)
		return
	}
	if err := h.Validate.Struct(req); err != nil {
		validationError(c, err)
		return
	}
	if req.Name == nil && req.Class == nil && req.Registry == nil && req.WarpCapable == nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "validation_failed",
			Details: []dto.ErrorDetail{{
				Field:   "body",
				Message: "At least one field is required",
			}},
		})
		return
	}

	var ship models.Ship
	if err := h.DB.First(&ship, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not_found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}

	updates := map[string]interface{}{}
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Class != nil {
		updates["class"] = *req.Class
	}
	if req.Registry != nil {
		updates["registry"] = *req.Registry
	}
	if req.WarpCapable != nil {
		updates["warp_capable"] = *req.WarpCapable
	}

	if err := h.DB.Model(&ship).Updates(updates).Error; err != nil {
		if isUnique(err) {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: "validation_failed",
				Details: []dto.ErrorDetail{{
					Field:   "registry",
					Message: "Registry must be unique",
				}},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	if err := h.DB.First(&ship, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	c.JSON(http.StatusOK, ship)
}

func (h *Handler) deleteShip(c *gin.Context) {
	id, ok := parseUUID(c, "id")
	if !ok {
		return
	}
	result := h.DB.Delete(&models.Ship{}, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "not_found"})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handler) listShipCrewmates(c *gin.Context) {
	id, ok := parseUUID(c, "id")
	if !ok {
		return
	}
	var ship models.Ship
	if err := h.DB.First(&ship, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not_found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	var crewmates []models.Crewmate
	if err := h.DB.Where("ship_id = ?", id).Order("rank asc").Find(&crewmates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	c.JSON(http.StatusOK, crewmates)
}

func (h *Handler) listShipMissions(c *gin.Context) {
	id, ok := parseUUID(c, "id")
	if !ok {
		return
	}
	var ship models.Ship
	if err := h.DB.First(&ship, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not_found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	var missions []models.Mission
	if err := h.DB.Where("ship_id = ?", id).Order("created_at asc").Find(&missions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	c.JSON(http.StatusOK, missions)
}

func (h *Handler) listCrewmates(c *gin.Context) {
	var crewmates []models.Crewmate
	if err := h.DB.Order("created_at asc").Find(&crewmates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	c.JSON(http.StatusOK, crewmates)
}

func (h *Handler) createCrewmate(c *gin.Context) {
	var req dto.CrewmateCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err)
		return
	}
	if err := h.Validate.Struct(req); err != nil {
		validationError(c, err)
		return
	}
	crewmate := models.Crewmate{
		ShipID:  req.ShipID,
		Name:    req.Name,
		Role:    req.Role,
		Species: req.Species,
		Rank:    req.Rank,
	}
	if err := h.DB.Create(&crewmate).Error; err != nil {
		if isForeignKey(err) {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: "validation_failed",
				Details: []dto.ErrorDetail{{
					Field:   "ship_id",
					Message: "Ship does not exist",
				}},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	c.JSON(http.StatusCreated, crewmate)
}

func (h *Handler) getCrewmate(c *gin.Context) {
	id, ok := parseUUID(c, "id")
	if !ok {
		return
	}
	var crewmate models.Crewmate
	if err := h.DB.First(&crewmate, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not_found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	c.JSON(http.StatusOK, crewmate)
}

func (h *Handler) updateCrewmate(c *gin.Context) {
	id, ok := parseUUID(c, "id")
	if !ok {
		return
	}
	var req dto.CrewmateUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err)
		return
	}
	if err := h.Validate.Struct(req); err != nil {
		validationError(c, err)
		return
	}
	if req.ShipID == nil && req.Name == nil && req.Role == nil && req.Species == nil && req.Rank == nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "validation_failed",
			Details: []dto.ErrorDetail{{
				Field:   "body",
				Message: "At least one field is required",
			}},
		})
		return
	}

	var crewmate models.Crewmate
	if err := h.DB.First(&crewmate, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not_found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}

	updates := map[string]interface{}{}
	if req.ShipID != nil {
		updates["ship_id"] = *req.ShipID
	}
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Role != nil {
		updates["role"] = *req.Role
	}
	if req.Species != nil {
		updates["species"] = *req.Species
	}
	if req.Rank != nil {
		updates["rank"] = *req.Rank
	}

	if err := h.DB.Model(&crewmate).Updates(updates).Error; err != nil {
		if isForeignKey(err) {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: "validation_failed",
				Details: []dto.ErrorDetail{{
					Field:   "ship_id",
					Message: "Ship does not exist",
				}},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	if err := h.DB.First(&crewmate, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	c.JSON(http.StatusOK, crewmate)
}

func (h *Handler) deleteCrewmate(c *gin.Context) {
	id, ok := parseUUID(c, "id")
	if !ok {
		return
	}
	result := h.DB.Delete(&models.Crewmate{}, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "not_found"})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handler) listMissions(c *gin.Context) {
	var missions []models.Mission
	if err := h.DB.Order("created_at asc").Find(&missions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	c.JSON(http.StatusOK, missions)
}

func (h *Handler) createMission(c *gin.Context) {
	var req dto.MissionCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err)
		return
	}
	if err := h.Validate.Struct(req); err != nil {
		validationError(c, err)
		return
	}
	status := models.StatusPlanned
	if req.Status != nil {
		status = *req.Status
	}
	mission := models.Mission{
		ShipID:    req.ShipID,
		Codename:  req.Codename,
		Objective: req.Objective,
		Status:    status,
		StartedAt: req.StartedAt,
		EndedAt:   req.EndedAt,
	}
	if err := h.DB.Create(&mission).Error; err != nil {
		if isForeignKey(err) {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: "validation_failed",
				Details: []dto.ErrorDetail{{
					Field:   "ship_id",
					Message: "Ship does not exist",
				}},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	c.JSON(http.StatusCreated, mission)
}

func (h *Handler) getMission(c *gin.Context) {
	id, ok := parseUUID(c, "id")
	if !ok {
		return
	}
	var mission models.Mission
	if err := h.DB.First(&mission, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not_found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	c.JSON(http.StatusOK, mission)
}

func (h *Handler) updateMission(c *gin.Context) {
	id, ok := parseUUID(c, "id")
	if !ok {
		return
	}
	var req dto.MissionUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err)
		return
	}
	if err := h.Validate.Struct(req); err != nil {
		validationError(c, err)
		return
	}
	if req.ShipID == nil && req.Codename == nil && req.Objective == nil && req.Status == nil && req.StartedAt == nil && req.EndedAt == nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "validation_failed",
			Details: []dto.ErrorDetail{{
				Field:   "body",
				Message: "At least one field is required",
			}},
		})
		return
	}

	var mission models.Mission
	if err := h.DB.First(&mission, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not_found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}

	updates := map[string]interface{}{}
	if req.ShipID != nil {
		updates["ship_id"] = *req.ShipID
	}
	if req.Codename != nil {
		updates["codename"] = *req.Codename
	}
	if req.Objective != nil {
		updates["objective"] = *req.Objective
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}
	if req.StartedAt != nil {
		updates["started_at"] = req.StartedAt
	}
	if req.EndedAt != nil {
		updates["ended_at"] = req.EndedAt
	}

	if err := h.DB.Model(&mission).Updates(updates).Error; err != nil {
		if isForeignKey(err) {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: "validation_failed",
				Details: []dto.ErrorDetail{{
					Field:   "ship_id",
					Message: "Ship does not exist",
				}},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	if err := h.DB.First(&mission, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	c.JSON(http.StatusOK, mission)
}

func (h *Handler) deleteMission(c *gin.Context) {
	id, ok := parseUUID(c, "id")
	if !ok {
		return
	}
	result := h.DB.Delete(&models.Mission{}, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "not_found"})
		return
	}
	c.Status(http.StatusNoContent)
}
