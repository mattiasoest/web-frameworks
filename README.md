# Rest Comparison: Six Stacks, One Spaceship API

Six functionally identical REST backends for a **Spaceship Crew Log** CRUD app, all sharing one Postgres schema. Compare how each language/framework handles the same API contract.

## Stacks

| Stack | Port | ORM | Validation |
|-------|------|-----|------------|
| Node.js + Express | 3001 | Prisma | Zod |
| Python + FastAPI | 3002 | SQLModel | Pydantic |
| Ruby on Rails (API) | 3003 | Active Record | Model validations |
| Java + Spring Boot | 3004 | Spring Data JPA | Bean Validation |
| Kotlin + Spring Boot | 3005 | Spring Data JPA | Bean Validation |
| Go + Gin | 3006 | GORM | go-playground/validator |

## Domain

- **Ship** — name, class, registry (unique), warp_capable
- **Crewmate** — belongs to a ship; name, role, species, rank
- **Mission** — belongs to a ship; codename, objective, status, started_at, ended_at

Schema lives in [`db/init.sql`](db/init.sql) — the single source of truth. All ORMs map to the existing schema (`validate` / no auto-migrate).

## Quick Start

```bash
cp .env.example .env
docker compose up --build
```

Services:

- Postgres: `localhost:5432`
- Node/Express: `http://localhost:3001`
- Python/FastAPI: `http://localhost:3002`
- Ruby/Rails: `http://localhost:3003`
- Java/Spring Boot: `http://localhost:3004`
- Kotlin/Spring Boot: `http://localhost:3005`
- Go/Gin: `http://localhost:3006`

Run contract smoke tests (requires all services up):

```bash
chmod +x tests/contract.sh
./tests/contract.sh
```

## API Contract

See [`shared/openapi.yaml`](shared/openapi.yaml).

```
GET|POST        /ships
GET|PATCH|DELETE /ships/{id}
GET             /ships/{id}/crewmates
GET             /ships/{id}/missions
GET|POST        /crewmates
GET|PATCH|DELETE /crewmates/{id}
GET|POST        /missions
GET|PATCH|DELETE /missions/{id}
GET             /healthz
```

JSON conventions: `snake_case`, UUID ids, ISO 8601 UTC timestamps.

Errors:
- `404` → `{ "error": "not_found" }`
- `400` → `{ "error": "validation_failed", "details": [...] }`

## Side-by-Side: Create a Ship

### Node/Express + Prisma + Zod

```javascript
const parsed = shipCreateSchema.safeParse(req.body);
if (!parsed.success) {
  return res.status(400).json(formatZodError(parsed.error));
}
const ship = await prisma.ship.create({ data: shipCreateToPrisma(parsed.data) });
res.status(201).json(serializeShip(ship));
```

### Python/FastAPI + SQLModel

```python
@app.post("/ships", status_code=201)
def create_ship(payload: ShipCreate, session: Session = Depends(get_session)):
    ship = Ship(name=payload.name, ship_class=payload.ship_class, ...)
    session.add(ship)
    session.commit()
    return _ship_to_read(ship)
```

### Ruby on Rails

```ruby
def create
  ship = Ship.new(ship_attributes(parse_json_body))
  ship.save!
  render json: ship, status: :created
end
```

### Java/Spring Boot

```java
@PostMapping("/ships")
public ResponseEntity<Ship> createShip(@Valid @RequestBody ShipCreateRequest request) {
    Ship ship = new Ship();
    ship.setName(request.getName());
    ship.setShipClass(request.getShipClass());
    return ResponseEntity.status(HttpStatus.CREATED).body(shipRepository.save(ship));
}
```

### Kotlin/Spring Boot

```kotlin
@PostMapping("/ships")
fun createShip(@Valid @RequestBody request: ShipCreateRequest): ResponseEntity<Ship> {
    val ship = Ship(name = request.name, shipClass = request.shipClass, ...)
    return ResponseEntity.status(HttpStatus.CREATED).body(shipRepository.save(ship))
}
```

### Go/Gin + GORM

```go
if err := h.Validate.Struct(req); err != nil {
    validationError(c, err)
    return
}
ship := models.Ship{Name: req.Name, Class: req.Class, Registry: req.Registry}
h.DB.Create(&ship)
c.JSON(http.StatusCreated, ship)
```

## Project Layout Comparison

| Concern | Express | FastAPI | Rails | Spring (Java/Kotlin) | Gin |
|---------|---------|---------|-------|----------------------|-----|
| Routing | Manual router | Decorators | `routes.rb` | Annotations | Gin groups |
| DB layer | Prisma client | SQLModel | Active Record | JPA repositories | GORM |
| Validation | Zod (explicit) | Pydantic (automatic) | Model validations | `@Valid` DTOs | struct tags |
| Serialization | Manual helpers | Pydantic aliases | `as_json` overrides | Jackson snake_case | struct JSON tags |
| Boilerplate | Medium | Low | Low (convention) | High | Medium |

## Local Dev (without Docker)

1. Start Postgres and apply schema:
   ```bash
   docker compose up postgres -d
   ```
2. Set `DATABASE_URL=postgresql://spaceship:spaceship@localhost:5432/spaceship`
3. Run each service from its directory (see per-stack README notes below).

Per-stack dev commands:
- **Node**: `npm install && npx prisma generate && npm run dev`
- **Python**: `pip install -r requirements.txt && uvicorn app.main:app --reload --port 3002`
- **Rails**: `bundle install && bundle exec puma -C config/puma.rb`
- **Java**: `mvn spring-boot:run`
- **Kotlin**: `./gradlew bootRun`
- **Go**: `go run ./cmd/server`

## What This Compares (and What It Doesn't)

**In scope:** CRUD ergonomics, validation patterns, routing style, ORM mapping, error handling, project structure.

**Out of scope:** Auth, pagination, benchmarks, frontend, M:N relationships.
