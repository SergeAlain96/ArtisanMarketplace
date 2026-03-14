import { Router } from 'express';
import { authRequired, requireRole } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../common/async-handler.js';
import { sendError, sendSuccess } from '../../common/response.js';
import { getDb } from '../../config/db.js';

const router = Router();

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

router.use(authRequired, requireRole('admin'));

router.get(
  '/admin/artisans',
  asyncHandler(async (req, res) => {
    const db = await getDb();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;
    const search = String(req.query.search || '').trim();

    const searchSql = search ? '%'.concat(search).concat('%') : null;

    const artisans = await db.all(
      `SELECT u.id, u.name, u.email, u.role, u.created_at AS createdAt,
              CASE WHEN ap.id IS NULL THEN 0 ELSE 1 END AS hasProfile,
              (SELECT COUNT(*) FROM products p WHERE p.artisan_id = u.id) AS productsCount,
              (SELECT COUNT(*) FROM ratings r WHERE r.artisan_id = u.id) AS ratingsCount
       FROM users u
       LEFT JOIN artisan_profiles ap ON ap.user_id = u.id
       WHERE u.role = 'artisan'
         AND (? IS NULL OR u.name LIKE ? OR u.email LIKE ?)
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      searchSql,
      searchSql,
      searchSql,
      limit,
      skip
    );

    const totalRow = await db.get(
      `SELECT COUNT(*) AS total
       FROM users u
       WHERE u.role = 'artisan'
         AND (? IS NULL OR u.name LIKE ? OR u.email LIKE ?)`,
      searchSql,
      searchSql,
      searchSql
    );

    const items = artisans.map((artisan) => ({
      _id: artisan.id,
      name: artisan.name,
      email: artisan.email,
      role: artisan.role,
      createdAt: artisan.createdAt,
      moderation: {
        hasProfile: Boolean(artisan.hasProfile),
        productsCount: artisan.productsCount,
        ratingsCount: artisan.ratingsCount
      }
    }));

    const total = totalRow.total;

    return sendSuccess(res, {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  })
);

router.delete(
  '/admin/artisan/:id',
  asyncHandler(async (req, res) => {
    const db = await getDb();
    const artisanId = parseId(req.params.id);

    if (!artisanId) {
      return sendError(res, 'Invalid artisan id', 400);
    }

    const artisan = await db.get('SELECT id FROM users WHERE id = ? AND role = ?', artisanId, 'artisan');
    if (!artisan) {
      return sendError(res, 'Artisan not found', 404);
    }

    const [productsCount, ratingsReceivedCount, ratingsGivenCount] = await Promise.all([
      db.get('SELECT COUNT(*) AS count FROM products WHERE artisan_id = ?', artisanId),
      db.get('SELECT COUNT(*) AS count FROM ratings WHERE artisan_id = ?', artisanId),
      db.get('SELECT COUNT(*) AS count FROM ratings WHERE user_id = ?', artisanId)
    ]);

    await db.exec('BEGIN TRANSACTION');
    try {
      await db.run('DELETE FROM artisan_profiles WHERE user_id = ?', artisanId);
      await db.run('DELETE FROM products WHERE artisan_id = ?', artisanId);
      await db.run('DELETE FROM ratings WHERE artisan_id = ?', artisanId);
      await db.run('DELETE FROM ratings WHERE user_id = ?', artisanId);
      await db.run('DELETE FROM users WHERE id = ?', artisanId);
      await db.exec('COMMIT');
    } catch (error) {
      await db.exec('ROLLBACK');
      throw error;
    }

    return sendSuccess(res, {
      deleted: true,
      moderationSummary: {
        artisanId,
        productsDeleted: productsCount.count,
        ratingsReceivedDeleted: ratingsReceivedCount.count,
        ratingsGivenDeleted: ratingsGivenCount.count
      }
    });
  })
);

router.delete(
  '/admin/product/:id',
  asyncHandler(async (req, res) => {
    const db = await getDb();
    const productId = parseId(req.params.id);

    if (!productId) {
      return sendError(res, 'Invalid product id', 400);
    }

    const deleted = await db.get(
      'SELECT id, artisan_id AS artisanId, name FROM products WHERE id = ?',
      productId
    );

    if (!deleted) {
      return sendError(res, 'Product not found', 404);
    }

    await db.run('DELETE FROM products WHERE id = ?', productId);

    return sendSuccess(res, {
      deleted: true,
      moderationSummary: {
        productId: deleted.id,
        artisanId: deleted.artisanId,
        productName: deleted.name
      }
    });
  })
);

export default router;
