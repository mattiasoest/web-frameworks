from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from sqlalchemy import Column, Integer, Text
from sqlalchemy.dialects.postgresql import ENUM
from sqlmodel import Field, SQLModel


class ShipClass(str, Enum):
    cruiser = "cruiser"
    frigate = "frigate"
    destroyer = "destroyer"
    scout = "scout"


class CrewmateRole(str, Enum):
    captain = "captain"
    engineer = "engineer"
    medic = "medic"
    pilot = "pilot"
    gunner = "gunner"


class MissionStatus(str, Enum):
    planned = "planned"
    active = "active"
    completed = "completed"
    failed = "failed"


ship_class_enum = ENUM(ShipClass, name="ship_class", create_type=False)
crewmate_role_enum = ENUM(CrewmateRole, name="crewmate_role", create_type=False)
mission_status_enum = ENUM(MissionStatus, name="mission_status", create_type=False)


class Ship(SQLModel, table=True):
    __tablename__ = "ships"

    id: Optional[UUID] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    ship_class: ShipClass = Field(sa_column=Column("class", ship_class_enum, nullable=False))
    registry: str = Field(max_length=255, unique=True)
    warp_capable: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Crewmate(SQLModel, table=True):
    __tablename__ = "crewmates"

    id: Optional[UUID] = Field(default=None, primary_key=True)
    ship_id: UUID = Field(foreign_key="ships.id")
    name: str = Field(max_length=255)
    role: CrewmateRole = Field(sa_column=Column("role", crewmate_role_enum, nullable=False))
    species: str = Field(max_length=255)
    crew_rank: int = Field(sa_column=Column("rank", Integer, nullable=False))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Mission(SQLModel, table=True):
    __tablename__ = "missions"

    id: Optional[UUID] = Field(default=None, primary_key=True)
    ship_id: UUID = Field(foreign_key="ships.id")
    codename: str = Field(max_length=255)
    objective: str = Field(sa_column=Column("objective", Text, nullable=False))
    status: MissionStatus = Field(
        default=MissionStatus.planned,
        sa_column=Column("status", mission_status_enum, nullable=False),
    )
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
