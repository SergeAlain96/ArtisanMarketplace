# RBAC Matrix

| Action | admin | artisan | user |
|---|---:|---:|---:|
| Register/Login | ✅ | ✅ | ✅ |
| View artisans | ✅ | ✅ | ✅ |
| View products | ✅ | ✅ | ✅ |
| Create artisan profile | ❌ | ✅ (self) | ❌ |
| Update artisan profile | ✅ (moderation) | ✅ (self) | ❌ |
| Create product | ❌ | ✅ (own) | ❌ |
| Update product | ✅ (moderation) | ✅ (own) | ❌ |
| Delete product | ✅ | ✅ (own) | ❌ |
| Create rating | ❌ | ✅ | ✅ |
| View artisan ratings | ✅ | ✅ | ✅ |
| Delete artisan profile | ✅ | ❌ | ❌ |

Notes:
- "self" means resource owned by authenticated user.
- ownership checks are mandatory in middleware/service layer.
