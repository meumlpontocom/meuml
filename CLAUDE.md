# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MeuML v2** — "Gerenciador de Marketplaces" (Marketplace Manager). A platform for e-commerce sellers to manage product listings, orders, payments, inventory, and analytics across MercadoLibre and Shopee.

Monorepo with `back-end/` (Python/Flask) and `front-end/` (React 16/Redux).

## Common Commands

### Running the project locally
```bash
# From root - run both back-end and front-end
npm run dev:full

# Back-end only (from back-end/)
source venv/bin/activate
bash application.sh          # Flask dev server

# Front-end only (from front-end/)
yarn start
```

### Celery workers (from back-end/)
```bash
bash celery_workers.sh        # Starts 2 dev workers
```

### Docker services (Redis + Flower)
```bash
cd back-end && docker-compose up -d
```

### Database migrations
SQL migration files live in `back-end/migrations/` with timestamp naming convention (e.g. `2020_02_18_150126 - description.sql`). These are raw SQL files applied directly against PostgreSQL.

### Front-end build
```bash
cd front-end && yarn build
```

### Tests
```bash
cd back-end && pytest
```

## Back-End Architecture

### Entry Points
- **Dev server:** `back-end/application.sh` → Flask app
- **Production:** `back-end/wsgi.py` → Gunicorn
- **Flask app factory:** `back-end/api/app.py`
- **Celery app:** `back-end/workers/app.py` (includes beat schedule)

### Action-Based API Pattern
All API endpoints are implemented as methods on Action classes that inherit from `libs/actions/actions.py:Actions`. Routes are registered in `api/routes.py` (~1400 lines, 50+ action classes).

The `@prepare` decorator (`libs/decorator/prepare.py`) extracts JWT user data from headers and parses request body/args into `self.data`.

### Database
- **PostgreSQL** with raw parameterized SQL (no ORM for primary logic despite SQLAlchemy being installed)
- Connection pooling via `libs/database/database_postgres.py` (`ThreadedConnectionPool`)
- Schema namespace: `meuml.*`
- Custom model/type system in `libs/database/model.py` and `libs/database/types.py`
- Query builder: `libs/database/query_builder.py`

### Celery Task System
- **Broker/Backend:** Redis
- **Config:** `libs/queue/queue.py`, `libs/queue/config_celery.py`
- **Task routing:** `libs/queue/task_router.py` routes tasks to queues: `local_priority`, `default`, `short_running`, `long_running`, `items_queue`
- **Tasks:** `workers/tasks/` organized by domain (mercadolibre/, shopee/, admin/, articles/, notifications/, stock/, tags/, vacation/)
- **Production:** PM2 manages workers across multiple servers via `ecosystem*.config.js` files

### Key Library Directories (`back-end/libs/`)
- `mercadolibre_api/` — MercadoLibre API wrapper
- `shopee_api/` — Shopee API integration
- `payments/` — Payment processing (PJBank, MercadoPago)
- `minio_api/` — Object storage (images)
- `plugnotas_api/` — NFSe emission
- `push/` — Push notifications (Firebase, Exponent)
- `whatsapp_api/` — WhatsApp integration
- `mail/` — Email with templates (`mail/mail_templates/`)
- `enums/` — Constants (marketplace types, statuses, access levels)

### Environment
Config loaded from `.env` (see `.env.example`). Key vars: `PG_DB_*` (Postgres), `REDIS_*`, `JWT_SECRET_KEY`, `CLIENT_ID`/`CLIENT_SECRET` (ML OAuth), `SHOPEE_PARTNER_*`.

## Front-End Architecture

- **React 16.13** with Redux (redux-thunk), React Router
- **UI Framework:** CoreUI Pro v3
- **HTTP:** Axios
- **Structure:** `src/views/` (40+ page components), `src/components/` (reusable), `src/redux/` (store/actions/reducers), `src/services/` (API calls), `src/routes.js`

## Deployment

- **CI/CD:** GitLab CI (`.gitlab-ci.yml` in both back-end and front-end)
- **Back-end:** PM2 process manager, Gunicorn WSGI
- **Front-end:** Static build deployed via CI
- **Environments:** Homolog (auto-deploy) and Production (manual trigger)

## Important Compatibility Notes

Several dependencies were upgraded for Python 3.12 compatibility:
- `tornado` 5.1.1 → 6.4
- `psycopg2-binary` 2.8.6 → 2.9.9
- `pendulum` 2.0.5 → 3.0.0 (has breaking API changes)
- `PyJWT` 1.7.1 → 2.9.0 (decode API changed)
- `yarl` 1.4.2 → 1.9.4
