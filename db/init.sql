-- Spaceship Crew Log schema (single source of truth)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE ship_class AS ENUM ('cruiser', 'frigate', 'destroyer', 'scout');
CREATE TYPE crewmate_role AS ENUM ('captain', 'engineer', 'medic', 'pilot', 'gunner');
CREATE TYPE mission_status AS ENUM ('planned', 'active', 'completed', 'failed');

CREATE TABLE ships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    "class" ship_class NOT NULL,
    registry VARCHAR(255) NOT NULL UNIQUE,
    warp_capable BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE crewmates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ship_id UUID NOT NULL REFERENCES ships(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role crewmate_role NOT NULL,
    species VARCHAR(255) NOT NULL,
    "rank" INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ship_id UUID NOT NULL REFERENCES ships(id) ON DELETE CASCADE,
    codename VARCHAR(255) NOT NULL,
    objective TEXT NOT NULL,
    status mission_status NOT NULL DEFAULT 'planned',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crewmates_ship_id ON crewmates(ship_id);
CREATE INDEX idx_missions_ship_id ON missions(ship_id);
CREATE INDEX idx_missions_status ON missions(status);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ships_updated_at
    BEFORE UPDATE ON ships
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER crewmates_updated_at
    BEFORE UPDATE ON crewmates
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER missions_updated_at
    BEFORE UPDATE ON missions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
