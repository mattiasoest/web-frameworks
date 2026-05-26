import os
from typing import Generator

from sqlalchemy import create_engine
from sqlmodel import Session

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://spaceship:spaceship@localhost:5433/spaceship"
)

engine = create_engine(DATABASE_URL)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
