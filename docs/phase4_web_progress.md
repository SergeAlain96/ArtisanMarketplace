# Phase 4 Progress (Frontend Web)

Status: **started**

## Implemented

### Stack

- Next.js App Router
- Tailwind CSS

### Pages

- Home: `/`
- Product Catalog: `/catalog`
- Artisan Profile: `/artisan/[id]`
- Login: `/login`
- Register: `/register`
- Artisan Dashboard: `/dashboard/artisan`
- Admin Dashboard: `/dashboard/admin`

### Components

- `Navbar`
- `ArtisanCard`
- `ProductCard`
- `RatingStars`
- `ProductForm`

### API integration

Web app consumes backend endpoints through:
- `src/lib/api.js`
- `src/lib/auth.js`

Environment variable:
- `NEXT_PUBLIC_API_BASE_URL`

### Access control and moderation UX

- Client access gate implemented via `AuthGate` component
- Role protection added for:
	- `/dashboard/artisan` (artisan only)
	- `/dashboard/admin` (admin only)
- Admin dashboard now supports moderation actions:
	- delete artisan from list
	- delete product by id

### Server-side route protection

- Next.js `middleware.js` protects:
	- `/dashboard/*`
	- `/login`
	- `/register`
- Token/role session is now persisted in cookie + localStorage.
- Login supports `?next=/target-path` redirect after authentication.

### Form UX polish

- Product form now includes client-side validation messages

## Next checkpoints

- Add protected route behavior on server side (cookie/session strategy).
- Add richer admin moderation table actions (bulk moderation, filters).
- Improve login/register feedback and redirect flows.
