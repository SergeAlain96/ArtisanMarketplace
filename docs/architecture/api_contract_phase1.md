# API Contract Baseline (Phase 1)

Base path: `/api/v1`

## Response format

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Human readable message",
  "details": {}
}
```

## Initial endpoint groups

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

- `POST /artisan/profile`
- `GET /artisans`
- `GET /artisan/:id`
- `PUT /artisan/profile`

- `POST /products`
- `GET /products`
- `GET /products/:id`
- `PUT /products/:id`
- `DELETE /products/:id`

- `POST /ratings`
- `GET /artisan/:id/ratings`

- `GET /admin/artisans`
- `DELETE /admin/artisan/:id`
- `DELETE /admin/product/:id`

## Auth

- Header: `Authorization: Bearer <token>`
- Unauthorized => `401`
- Forbidden (role mismatch) => `403`

## Pagination

`GET /products?page=1&limit=12`

Metadata format:

```json
{
  "page": 1,
  "limit": 12,
  "total": 125,
  "totalPages": 11
}
```
