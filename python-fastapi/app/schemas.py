from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from .models import CrewmateRole, MissionStatus, ShipClass


class ErrorDetail(BaseModel):
    field: str
    message: str


class ErrorResponse(BaseModel):
    error: str
    details: Optional[list[ErrorDetail]] = None


class ShipRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    ship_class: ShipClass = Field(serialization_alias="class")
    registry: str
    warp_capable: bool
    created_at: datetime
    updated_at: datetime


class ShipCreate(BaseModel):
    name: str
    ship_class: ShipClass = Field(alias="class")
    registry: str
    warp_capable: bool = False

    model_config = ConfigDict(populate_by_name=True)


class ShipUpdate(BaseModel):
    name: Optional[str] = None
    ship_class: Optional[ShipClass] = Field(default=None, alias="class")
    registry: Optional[str] = None
    warp_capable: Optional[bool] = None

    model_config = ConfigDict(populate_by_name=True)


class CrewmateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    ship_id: UUID
    name: str
    role: CrewmateRole
    species: str
    crew_rank: int = Field(serialization_alias="rank")
    created_at: datetime
    updated_at: datetime


class CrewmateCreate(BaseModel):
    ship_id: UUID
    name: str
    role: CrewmateRole
    species: str
    crew_rank: int = Field(alias="rank")

    model_config = ConfigDict(populate_by_name=True)


class CrewmateUpdate(BaseModel):
    ship_id: Optional[UUID] = None
    name: Optional[str] = None
    role: Optional[CrewmateRole] = None
    species: Optional[str] = None
    crew_rank: Optional[int] = Field(default=None, alias="rank")

    model_config = ConfigDict(populate_by_name=True)


class MissionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    ship_id: UUID
    codename: str
    objective: str
    status: MissionStatus
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class MissionCreate(BaseModel):
    ship_id: UUID
    codename: str
    objective: str
    status: MissionStatus = MissionStatus.planned
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None


class MissionUpdate(BaseModel):
    ship_id: Optional[UUID] = None
    codename: Optional[str] = None
    objective: Optional[str] = None
    status: Optional[MissionStatus] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
