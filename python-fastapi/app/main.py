from datetime import datetime
from typing import Any
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, Response
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from .database import get_session
from .models import Crewmate, Mission, Ship
from .schemas import (
    CrewmateCreate,
    CrewmateRead,
    CrewmateUpdate,
    MissionCreate,
    MissionRead,
    MissionUpdate,
    ShipCreate,
    ShipRead,
    ShipUpdate,
)

app = FastAPI(title="Spaceship Crew Log - FastAPI")


@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "error" in exc.detail:
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"error": str(exc.detail)})


@app.exception_handler(RequestValidationError)
async def request_validation_handler(_request: Request, exc: RequestValidationError):
    details = []
    for error in exc.errors():
        loc = [str(part) for part in error.get("loc", []) if part != "body"]
        details.append({"field": ".".join(loc) or "body", "message": error.get("msg", "Invalid value")})
    return JSONResponse(status_code=400, content={"error": "validation_failed", "details": details})


def _integrity_error_response(exc: IntegrityError) -> JSONResponse:
    message = str(exc.orig).lower()
    if "ships" in message and "foreign key" in message:
        return JSONResponse(
            status_code=400,
            content={
                "error": "validation_failed",
                "details": [{"field": "ship_id", "message": "Ship does not exist"}],
            },
        )
    if "registry" in message or "unique" in message:
        return JSONResponse(
            status_code=400,
            content={
                "error": "validation_failed",
                "details": [{"field": "registry", "message": "Registry must be unique"}],
            },
        )
    return JSONResponse(status_code=400, content={"error": "validation_failed", "details": []})


def _ship_to_read(ship: Ship) -> dict[str, Any]:
    return ShipRead.model_validate(ship).model_dump(by_alias=True, mode="json")


def _crewmate_to_read(crewmate: Crewmate) -> dict[str, Any]:
    return CrewmateRead.model_validate(crewmate).model_dump(by_alias=True, mode="json")


def _mission_to_read(mission: Mission) -> dict[str, Any]:
    return MissionRead.model_validate(mission).model_dump(mode="json")


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.get("/ships")
def list_ships(session: Session = Depends(get_session)):
    ships = session.exec(select(Ship).order_by(Ship.created_at)).all()
    return [_ship_to_read(ship) for ship in ships]


@app.post("/ships", status_code=201)
def create_ship(payload: ShipCreate, session: Session = Depends(get_session)):
    ship = Ship(
        name=payload.name,
        ship_class=payload.ship_class,
        registry=payload.registry,
        warp_capable=payload.warp_capable,
    )
    session.add(ship)
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        return _integrity_error_response(exc)
    session.refresh(ship)
    return _ship_to_read(ship)


@app.get("/ships/{ship_id}")
def get_ship(ship_id: UUID, session: Session = Depends(get_session)):
    ship = session.get(Ship, ship_id)
    if not ship:
        raise HTTPException(status_code=404, detail={"error": "not_found"})
    return _ship_to_read(ship)


@app.patch("/ships/{ship_id}")
def update_ship(ship_id: UUID, payload: ShipUpdate, session: Session = Depends(get_session)):
    ship = session.get(Ship, ship_id)
    if not ship:
        raise HTTPException(status_code=404, detail={"error": "not_found"})

    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "validation_failed",
                "details": [{"field": "body", "message": "At least one field is required"}],
            },
        )

    for key, value in data.items():
        setattr(ship, key, value)
    ship.updated_at = datetime.utcnow()

    try:
        session.add(ship)
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        return _integrity_error_response(exc)
    session.refresh(ship)
    return _ship_to_read(ship)


@app.delete("/ships/{ship_id}", status_code=204)
def delete_ship(ship_id: UUID, session: Session = Depends(get_session)):
    ship = session.get(Ship, ship_id)
    if not ship:
        raise HTTPException(status_code=404, detail={"error": "not_found"})
    session.delete(ship)
    session.commit()
    return Response(status_code=204)


@app.get("/ships/{ship_id}/crewmates")
def list_ship_crewmates(ship_id: UUID, session: Session = Depends(get_session)):
    ship = session.get(Ship, ship_id)
    if not ship:
        raise HTTPException(status_code=404, detail={"error": "not_found"})
    crewmates = session.exec(
        select(Crewmate).where(Crewmate.ship_id == ship_id).order_by(Crewmate.crew_rank)
    ).all()
    return [_crewmate_to_read(crewmate) for crewmate in crewmates]


@app.get("/ships/{ship_id}/missions")
def list_ship_missions(ship_id: UUID, session: Session = Depends(get_session)):
    ship = session.get(Ship, ship_id)
    if not ship:
        raise HTTPException(status_code=404, detail={"error": "not_found"})
    missions = session.exec(
        select(Mission).where(Mission.ship_id == ship_id).order_by(Mission.created_at)
    ).all()
    return [_mission_to_read(mission) for mission in missions]


@app.get("/crewmates")
def list_crewmates(session: Session = Depends(get_session)):
    crewmates = session.exec(select(Crewmate).order_by(Crewmate.created_at)).all()
    return [_crewmate_to_read(crewmate) for crewmate in crewmates]


@app.post("/crewmates", status_code=201)
def create_crewmate(payload: CrewmateCreate, session: Session = Depends(get_session)):
    crewmate = Crewmate(
        ship_id=payload.ship_id,
        name=payload.name,
        role=payload.role,
        species=payload.species,
        crew_rank=payload.crew_rank,
    )
    session.add(crewmate)
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        return _integrity_error_response(exc)
    session.refresh(crewmate)
    return _crewmate_to_read(crewmate)


@app.get("/crewmates/{crewmate_id}")
def get_crewmate(crewmate_id: UUID, session: Session = Depends(get_session)):
    crewmate = session.get(Crewmate, crewmate_id)
    if not crewmate:
        raise HTTPException(status_code=404, detail={"error": "not_found"})
    return _crewmate_to_read(crewmate)


@app.patch("/crewmates/{crewmate_id}")
def update_crewmate(crewmate_id: UUID, payload: CrewmateUpdate, session: Session = Depends(get_session)):
    crewmate = session.get(Crewmate, crewmate_id)
    if not crewmate:
        raise HTTPException(status_code=404, detail={"error": "not_found"})

    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "validation_failed",
                "details": [{"field": "body", "message": "At least one field is required"}],
            },
        )

    for key, value in data.items():
        setattr(crewmate, key, value)
    crewmate.updated_at = datetime.utcnow()

    try:
        session.add(crewmate)
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        return _integrity_error_response(exc)
    session.refresh(crewmate)
    return _crewmate_to_read(crewmate)


@app.delete("/crewmates/{crewmate_id}", status_code=204)
def delete_crewmate(crewmate_id: UUID, session: Session = Depends(get_session)):
    crewmate = session.get(Crewmate, crewmate_id)
    if not crewmate:
        raise HTTPException(status_code=404, detail={"error": "not_found"})
    session.delete(crewmate)
    session.commit()
    return Response(status_code=204)


@app.get("/missions")
def list_missions(session: Session = Depends(get_session)):
    missions = session.exec(select(Mission).order_by(Mission.created_at)).all()
    return [_mission_to_read(mission) for mission in missions]


@app.post("/missions", status_code=201)
def create_mission(payload: MissionCreate, session: Session = Depends(get_session)):
    mission = Mission(
        ship_id=payload.ship_id,
        codename=payload.codename,
        objective=payload.objective,
        status=payload.status,
        started_at=payload.started_at,
        ended_at=payload.ended_at,
    )
    session.add(mission)
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        return _integrity_error_response(exc)
    session.refresh(mission)
    return _mission_to_read(mission)


@app.get("/missions/{mission_id}")
def get_mission(mission_id: UUID, session: Session = Depends(get_session)):
    mission = session.get(Mission, mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail={"error": "not_found"})
    return _mission_to_read(mission)


@app.patch("/missions/{mission_id}")
def update_mission(mission_id: UUID, payload: MissionUpdate, session: Session = Depends(get_session)):
    mission = session.get(Mission, mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail={"error": "not_found"})

    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "validation_failed",
                "details": [{"field": "body", "message": "At least one field is required"}],
            },
        )

    for key, value in data.items():
        setattr(mission, key, value)
    mission.updated_at = datetime.utcnow()

    try:
        session.add(mission)
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        return _integrity_error_response(exc)
    session.refresh(mission)
    return _mission_to_read(mission)


@app.delete("/missions/{mission_id}", status_code=204)
def delete_mission(mission_id: UUID, session: Session = Depends(get_session)):
    mission = session.get(Mission, mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail={"error": "not_found"})
    session.delete(mission)
    session.commit()
    return Response(status_code=204)
