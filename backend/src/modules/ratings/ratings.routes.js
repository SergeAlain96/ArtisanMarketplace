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

const createRatingSchema = z.object({
  artisanId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional()
});

const updateRatingSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().max(500).optional()
});

router.post(
  '/ratings',
  authRequired,
  requireRole('user', 'artisan'),
  validateBody(createRatingSchema),
  asyncHandler(async (req, res) => {
    const db = await getDb();
    const { artisanId, rating, comment } = req.body;
    const parsedArtisanId = parseId(artisanId);

    if (!parsedArtisanId) {
      return sendError(res, 'Invalid artisan id', 400);
    }

    if (String(parsedArtisanId) === String(req.user.id)) {
      return sendError(res, 'You cannot rate yourself', 400);
    }

    const artisan = await db.get('SELECT id FROM users WHERE id = ? AND role = ?', parsedArtisanId, 'artisan');
    if (!artisan) {
      return sendError(res, 'Artisan not found', 404);
    }

    try {
      const created = await db.run(
        `INSERT INTO ratings (user_id, artisan_id, rating, comment)
         VALUES (?, ?, ?, ?)`,
        Number(req.user.id),
        parsedArtisanId,
        rating,
        comment || ''
      );

      const row = await db.get(
        `SELECT id, user_id AS userId, artisan_id AS artisanId, rating, comment,
                created_at AS createdAt
         FROM ratings WHERE id = ?`,
        created.lastID
      );

      return sendSuccess(res, { ...row, _id: row.id }, 201);
    } catch (error) {
      if (String(error.message || '').includes('UNIQUE')) {
        return sendError(res, 'You already rated this artisan', 409);
      }

      throw error;
    }
  })
);

router.get(
  '/artisan/:id/ratings',
  asyncHandler(async (req, res) => {
    const db = await getDb();
    const artisanId = parseId(req.params.id);

    if (!artisanId) {
      return sendError(res, 'Invalid artisan id', 400);
    }

    const items = await db.all(
      `SELECT r.id, r.user_id AS userId, r.artisan_id AS artisanId, r.rating, r.comment,
              r.created_at AS createdAt, u.name AS userName, u.role AS userRole
       FROM ratings r
       LEFT JOIN users u ON u.id = r.user_id
       WHERE r.artisan_id = ?
       ORDER BY r.created_at DESC`,
      artisanId
    );

    const mappedItems = items.map((item) => ({
      _id: item.id,
      userId: {
        _id: item.userId,
        name: item.userName,
        role: item.userRole
      },
      artisanId: item.artisanId,
      rating: item.rating,
      comment: item.comment,
      createdAt: item.createdAt
    }));

    const average =
      mappedItems.length > 0
        ? Number(
            (mappedItems.reduce((sum, item) => sum + item.rating, 0) / mappedItems.length).toFixed(2)
          )
        : 0;

    return sendSuccess(res, {
      items: mappedItems,
      average,
      count: mappedItems.length
    });
  })
);

router.put(
  '/ratings/:id',
  authRequired,
  requireRole('user', 'artisan', 'admin'),
  validateBody(updateRatingSchema),
  asyncHandler(async (req, res) => {
    const db = await getDb();
    const id = parseId(req.params.id);

    if (!id) {
      return sendError(res, 'Invalid rating id', 400);
    }

    const existing = await db.get(
      `SELECT id, user_id AS userId, artisan_id AS artisanId, rating, comment,
              created_at AS createdAt
       FROM ratings WHERE id = ?`,
      id
    );

    if (!existing) {
      return sendError(res, 'Rating not found', 404);
    }

    const isOwner = String(existing.userId) === String(req.user.id);
    if (req.user.role !== 'admin' && !isOwner) {
      return sendError(res, 'Forbidden', 403);
    }

    const nextRating = req.body.rating ?? existing.rating;
    const nextComment = req.body.comment ?? existing.comment;

    await db.run(
      `UPDATE ratings
       SET rating = ?, comment = ?
       WHERE id = ?`,
      nextRating,
      nextComment,
      id
    );

    const updated = await db.get(
      `SELECT id, user_id AS userId, artisan_id AS artisanId, rating, comment,
              created_at AS createdAt
       FROM ratings WHERE id = ?`,
      id
    );

    return sendSuccess(res, { ...updated, _id: updated.id });
  })
);

router.delete(
  '/ratings/:id',
  authRequired,
  requireRole('user', 'artisan', 'admin'),
  asyncHandler(async (req, res) => {
    const db = await getDb();
    const id = parseId(req.params.id);

    if (!id) {
      return sendError(res, 'Invalid rating id', 400);
    }

    const existing = await db.get('SELECT id, user_id AS userId FROM ratings WHERE id = ?', id);

    if (!existing) {
      return sendError(res, 'Rating not found', 404);
    }

    const isOwner = String(existing.userId) === String(req.user.id);
    if (req.user.role !== 'admin' && !isOwner) {
      return sendError(res, 'Forbidden', 403);
    }

    await db.run('DELETE FROM ratings WHERE id = ?', id);

    return sendSuccess(res, { deleted: true });
  })
);

export default router;
