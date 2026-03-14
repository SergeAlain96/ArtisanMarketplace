# Phase 6 Progress (Security & Optimization)

Status: **started**

## Implemented

### API hardening

- Disabled `x-powered-by`
- Added `trust proxy` configuration
- Added `hpp` protection (query pollution)
- Added `compression` middleware
- Limited JSON body size to `100kb`
- Strict CORS methods and headers

### Rate limiting

- Global API limiter on `/api/v1`
- Dedicated auth limiter on `/api/v1/auth`
- Configurable via env variables:
  - `API_RATE_LIMIT_WINDOW_MS`
  - `API_RATE_LIMIT_MAX`
  - `RATE_LIMIT_WINDOW_MS`
  - `RATE_LIMIT_MAX`

### JWT security

- JWT signing now uses:
  - `issuer`
  - `audience`
  - `HS256` algorithm
- JWT verification now enforces issuer/audience/algorithm
- New env variables:
  - `JWT_ISSUER`
  - `JWT_AUDIENCE`

### Password policy

- Registration requires:
  - uppercase letter
  - lowercase letter
  - digit
  - length between 8 and 72

## Files touched

- `backend/src/app.js`
- `backend/src/config/env.js`
- `backend/src/modules/auth/auth.routes.js`
- `backend/src/middlewares/auth.middleware.js`
- `backend/.env.example`
- `backend/package.json`

## Next checkpoints

- Add security-focused API tests for rate limit and JWT claims.
- Prepare production env values and secret rotation policy.
