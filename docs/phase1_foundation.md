# Phase 1 Foundation (Web + API only)

## 1) Scope Decision

For now, the project will include:

- Web application (Next.js)
- REST API backend (Node.js + Express)
- MongoDB database

Mobile (Flutter) is deferred to a later milestone.

---

## 2) Technical Decisions (MVP)

### Backend

- Runtime: Node.js LTS
- Framework: Express.js
- ORM/ODM: Mongoose
- Auth: JWT + bcrypt
- Validation: Zod
- API docs: Swagger (OpenAPI)
- Security middleware: helmet, cors, express-rate-limit

### Web Frontend

- Framework: Next.js (App Router)
- UI: Tailwind CSS
- Data fetching: native fetch + server actions/api routes as needed
- Auth storage: HTTP-only cookie for access token (or secure token strategy)

### Database

- MongoDB Atlas

---

## 3) Initial Monorepo Structure

```text
/marketplace
  /backend
    /src
      /config
      /middlewares
      /modules
        /auth
        /users
        /artisans
        /products
        /ratings
        /admin
      /docs
      app.js
      server.js
  /web
    /src
      /app
      /components
      /lib
```

---

## 4) Role Matrix (RBAC)

### `admin`

- Read all artisans/products/ratings
- Delete artisan profile (moderation)
- Delete product (moderation)

### `artisan`

- Create/update own artisan profile
- Create/update/delete own products
- Read ratings for own artisan profile

### `user`

- Browse artisans/products
- Create rating for an artisan

---

## 5) Data Model (Mongoose-oriented)

## `User`

- `_id: ObjectId`
- `name: string` (required, min 2)
- `email: string` (required, unique, lowercase)
- `passwordHash: string` (required)
- `role: 'admin' | 'artisan' | 'user'` (default `user`)
- `createdAt, updatedAt`

Indexes:
- unique index on `email`

## `ArtisanProfile`

- `_id: ObjectId`
- `userId: ObjectId` (ref `User`, unique)
- `bio: string` (max 500)
- `location: string`
- `avatarUrl: string`
- `createdAt, updatedAt`

Indexes:
- unique index on `userId`

## `Product`

- `_id: ObjectId`
- `artisanId: ObjectId` (ref `User`)
- `name: string` (required)
- `description: string` (required)
- `price: number` (required, min 0)
- `images: string[]`
- `createdAt, updatedAt`

Indexes:
- index on `artisanId`
- text index on `name` + `description` (optional for search)

## `Rating`

- `_id: ObjectId`
- `userId: ObjectId` (ref `User`)
- `artisanId: ObjectId` (ref `User`)
- `rating: number` (1..5)
- `comment: string` (max 500)
- `createdAt, updatedAt`

Indexes:
- compound unique index on `(userId, artisanId)` to prevent duplicate rating per user/artisan
- index on `artisanId`

---

## 6) API Conventions (Phase 1 baseline)

- Base URL: `/api/v1`
- Response format:
  - success: `{ success: true, data: ... }`
  - error: `{ success: false, message: string, details?: any }`
- Auth header: `Authorization: Bearer <token>`
- Pagination shape:
  - `?page=1&limit=10`
  - response metadata: `page`, `limit`, `total`, `totalPages`

---

## 7) Security Baseline (to enforce starting Day 2)

- Hash password with bcrypt
- JWT expiration + secret from env
- Validate all request bodies (Zod)
- `helmet()` enabled
- Strict CORS allowlist (web domain)
- Rate limit on auth routes
- Never return password hash

---

## 8) Phase 1 Deliverables Completed

- Scope fixed (without mobile)
- Roles and permissions clarified
- Data model ready for implementation
- API and security standards defined

Next step: start Phase 2 Day 2 (`auth` module + JWT flow).
