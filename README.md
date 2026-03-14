# Artisan Marketplace

Current stage: **Phase 6 (Security & Optimization) in progress**

Active scope:
- Web app
- REST API backend
- Mobile app (Flutter)
- SQLite (temporary local mode)

Mobile phase is now started.

## Docs

- Roadmap: [artisan_marketplace_roadmap.md](artisan_marketplace_roadmap.md)
- Collaborator onboarding: [COLLABORATEUR_ONBOARDING.md](COLLABORATEUR_ONBOARDING.md)
- Phase 1 foundation: [docs/phase1_foundation.md](docs/phase1_foundation.md)
- RBAC: [docs/architecture/rbac_matrix.md](docs/architecture/rbac_matrix.md)
- Domain model: [docs/architecture/domain_model.md](docs/architecture/domain_model.md)
- API contract baseline: [docs/architecture/api_contract_phase1.md](docs/architecture/api_contract_phase1.md)
- Phase 1 checklist: [docs/phase1_checklist.md](docs/phase1_checklist.md)
- Phase 2 backend progress: [docs/phase2_backend_progress.md](docs/phase2_backend_progress.md)
- Phase 3 admin moderation progress: [docs/phase3_admin_moderation_progress.md](docs/phase3_admin_moderation_progress.md)
- Phase 4 web progress: [docs/phase4_web_progress.md](docs/phase4_web_progress.md)
- Phase 5 mobile progress: [docs/phase5_mobile_progress.md](docs/phase5_mobile_progress.md)
- Phase 6 security progress: [docs/phase6_security_progress.md](docs/phase6_security_progress.md)
- Postman collection: [docs/postman/Artisan Marketplace API.postman_collection.json](docs/postman/Artisan%20Marketplace%20API.postman_collection.json)

Phase 4 highlights now include:
- role-gated artisan/admin dashboards on web
- admin moderation actions available in dashboard UI
- server-side route protection through Next.js middleware + session cookies

## Backend quick commands

- Install deps: `npm install` (in backend)
- Run API: `npm run dev`
- Seed admin: `npm run seed:admin`

Database for now:
- SQLite file at `backend/data/marketplace.sqlite`

## Backend Docker

- Dockerfile: [backend/Dockerfile](backend/Dockerfile)
- Compose: [backend/docker-compose.yml](backend/docker-compose.yml)

Minimal flow:
- create `backend/.env` from `backend/.env.example`
- run `docker compose up --build` from backend folder
