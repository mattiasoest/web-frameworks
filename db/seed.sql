-- Sample data for local development and contract tests

INSERT INTO ships (id, name, "class", registry, warp_capable, created_at, updated_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'USS Horizon', 'cruiser', 'NCC-1701', true, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
    ('22222222-2222-2222-2222-222222222222', 'SS Valkyrie', 'frigate', 'REG-0042', false, '2026-01-02T00:00:00Z', '2026-01-02T00:00:00Z');

INSERT INTO crewmates (id, ship_id, name, role, species, "rank", created_at, updated_at)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Ada Lovelace', 'captain', 'Human', 1, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Grace Hopper', 'engineer', 'Human', 2, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Zyx-7', 'pilot', 'Andorian', 1, '2026-01-02T00:00:00Z', '2026-01-02T00:00:00Z');

INSERT INTO missions (id, ship_id, codename, objective, status, started_at, ended_at, created_at, updated_at)
VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'Operation Nebula', 'Chart unmapped nebula sector', 'active', '2026-01-10T08:00:00Z', NULL, '2026-01-05T00:00:00Z', '2026-01-05T00:00:00Z'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'Rescue Echo', 'Extract stranded survey team', 'planned', NULL, NULL, '2026-01-06T00:00:00Z', '2026-01-06T00:00:00Z');
