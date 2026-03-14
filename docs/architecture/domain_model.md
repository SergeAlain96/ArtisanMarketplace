# Domain Model (Phase 1)

## Entities

- User
- ArtisanProfile
- Product
- Rating

## Relationships

- One `User` can have zero or one `ArtisanProfile`.
- One artisan `User` can own many `Product`.
- One `User` can create many `Rating`.
- One artisan `User` can receive many `Rating`.
- One `User` can rate a given artisan only once (unique `(userId, artisanId)`).

## Integrity rules

1. `Product.artisanId` must reference a `User` with role `artisan`.
2. `Rating.artisanId` must reference a `User` with role `artisan`.
3. `Rating.userId` and `Rating.artisanId` cannot be the same user.
4. deleting an artisan should handle orphan products/ratings via moderation strategy.
