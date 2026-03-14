# Phase 2 Progress (Backend Day 2-4)

Status: **started and scaffolded**

## Implemented now

### Infrastructure

- Express app with security middlewares (`helmet`, `cors`, `express-rate-limit`)
- MongoDB connection with Mongoose
- Global error handling and 404 handler
- Swagger UI mounted on `/api-docs`
- Admin seed script (`npm run seed:admin`)
- OpenAPI routes documented for auth/artisans/products/ratings/admin
- Docker deployment files prepared (Dockerfile + docker-compose)

### Authentication (`/api/v1/auth`)

- `POST /register`
- `POST /login`
- `GET /me`

Features:
- JWT generation
- Password hashing with `bcryptjs`
- Role-aware login payload

### Artisan Profiles

- `POST /api/v1/artisan/profile`
- `PUT /api/v1/artisan/profile`
- `GET /api/v1/artisans`
- `GET /api/v1/artisan/:id`

### Products

- `POST /api/v1/products`
- `GET /api/v1/products`
- `GET /api/v1/products/:id`
- `PUT /api/v1/products/:id`
- `DELETE /api/v1/products/:id`

### Ratings

- `POST /api/v1/ratings`
- `GET /api/v1/artisan/:id/ratings`

### Admin Moderation

- `GET /api/v1/admin/artisans`
- `DELETE /api/v1/admin/artisan/:id`
- `DELETE /api/v1/admin/product/:id`

## Notes

- Mobile is still out of scope for now.
- To run locally, create `backend/.env` from `backend/.env.example` and set valid values.
- Postman collection: `docs/postman/Artisan Marketplace API.postman_collection.json`
- Temporary local DB mode switched to SQLite for easier execution without Docker/Mongo service.
