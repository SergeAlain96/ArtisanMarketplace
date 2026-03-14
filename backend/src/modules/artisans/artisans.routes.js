import { Router } from 'express';
import { z } from 'zod';
import { authRequired, requireRole } from '../../middlewares/auth.middleware.js';
import { validateBody } from '../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../common/async-handler.js';
import { sendError, sendSuccess } from '../../common/response.js';
import { getDb } from '../../config/db.js';

const router = Router();

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const profileSchema = z.object({
  bio: z.string().max(500).optional(),
  location: z.string().max(120).optional(),
  avatarUrl: z.string().url().optional().or(z.literal(''))
});

router.post(
  '/artisan/profile',
  authRequired,
  requireRole('artisan'),
  validateBody(profileSchema),
  asyncHandler(async (req, res) => {
    const db = await getDb();
    const userId = Number(req.user.id);

    const existing = await db.get('SELECT id FROM artisan_profiles WHERE user_id = ?', userId);

    if (existing) {
      return sendError(res, 'Artisan profile already exists', 409);
    }

    const created = await db.run(
      `INSERT INTO artisan_profiles (user_id, bio, location, avatar_url)
       VALUES (?, ?, ?, ?)`,
      userId,
      req.body.bio || '',
      req.body.location || '',
      req.body.avatarUrl || ''
    );

    const profile = await db.get(
      `SELECT id, user_id AS userId, bio, location, avatar_url AS avatarUrl,
              created_at AS createdAt, updated_at AS updatedAt
       FROM artisan_profiles WHERE id = ?`,
      created.lastID
    );

    return sendSuccess(res, profile, 201);
  })
);

router.put(
  '/artisan/profile',
  authRequired,
  requireRole('artisan'),
  validateBody(profileSchema),
  asyncHandler(async (req, res) => {
    const db = await getDb();
    const userId = Number(req.user.id);

    const existing = await db.get('SELECT id FROM artisan_profiles WHERE user_id = ?', userId);

    if (!existing) {
      return sendError(res, 'Artisan profile not found', 404);
    }

    await db.run(
      `UPDATE artisan_profiles
       SET bio = ?, location = ?, avatar_url = ?, updated_at = datetime('now')
       WHERE user_id = ?`,
      req.body.bio ?? '',
      req.body.location ?? '',
      req.body.avatarUrl ?? '',
      userId
    );

    const profile = await db.get(
      `SELECT id, user_id AS userId, bio, location, avatar_url AS avatarUrl,
              created_at AS createdAt, updated_at AS updatedAt
       FROM artisan_profiles WHERE user_id = ?`,
      userId
    );

    return sendSuccess(res, profile);
  })
);

router.get(
  '/artisans',
  asyncHandler(async (req, res) => {
    const db = await getDb();

    const profiles = await db.all(`
      SELECT
        ap.id,
        ap.user_id AS userId,
        ap.bio,
        ap.location,
        ap.avatar_url AS avatarUrl,
        ap.created_at AS createdAt,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.role AS user_role,
        u.created_at AS user_createdAt
      FROM artisan_profiles ap
      INNER JOIN users u ON u.id = ap.user_id
      WHERE u.role = 'artisan'
      ORDER BY ap.created_at DESC
    `);

    const items = profiles.map((row) => ({
      _id: row.id,
      userId: {
        _id: row.user_id,
        name: row.user_name,
        email: row.user_email,
        role: row.user_role,
        createdAt: row.user_createdAt
      },
      bio: row.bio,
      location: row.location,
      avatarUrl: row.avatarUrl,
      createdAt: row.createdAt
    }));

    return sendSuccess(res, { items });
  })
);

router.get(
  '/artisan/:id',
  asyncHandler(async (req, res) => {
    const db = await getDb();
    const artisanId = parseId(req.params.id);

    if (!artisanId) {
      return sendError(res, 'Invalid artisan id', 400);
    }

    const artisanUser = await db.get(
      'SELECT id, name, email, role FROM users WHERE id = ? AND role = ?',
      artisanId,
      'artisan'
    );

    if (!artisanUser) {
      return sendError(res, 'Artisan not found', 404);
    }

    const profile = await db.get(
      `SELECT id, user_id AS userId, bio, location, avatar_url AS avatarUrl,
              created_at AS createdAt, updated_at AS updatedAt
       FROM artisan_profiles WHERE user_id = ?`,
      artisanId
    );

    const productsRows = await db.all(
      `SELECT id, artisan_id AS artisanId, name, description, price, images,
              created_at AS createdAt, updated_at AS updatedAt
       FROM products WHERE artisan_id = ? ORDER BY created_at DESC`,
      artisanId
    );

    const products = productsRows.map((row) => ({
      ...row,
      _id: row.id,
      images: JSON.parse(row.images || '[]')
    }));

    return sendSuccess(res, {
      artisan: {
        _id: artisanUser.id,
        name: artisanUser.name,
        email: artisanUser.email,
        role: artisanUser.role
      },
      profile,
      products
    });
  })
);

export default router;
