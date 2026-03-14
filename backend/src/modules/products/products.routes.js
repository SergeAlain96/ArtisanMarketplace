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

const createProductSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(5).max(2000),
  price: z.number().nonnegative(),
  images: z.array(z.string().url()).optional()
});

const updateProductSchema = createProductSchema.partial();

router.post(
  '/products',
  authRequired,
  requireRole('artisan'),
  validateBody(createProductSchema),
  asyncHandler(async (req, res) => {
    const db = await getDb();

    const created = await db.run(
      `INSERT INTO products (artisan_id, name, description, price, images)
       VALUES (?, ?, ?, ?, ?)`,
      Number(req.user.id),
      req.body.name,
      req.body.description,
      req.body.price,
      JSON.stringify(req.body.images || [])
    );

    const row = await db.get(
      `SELECT id, artisan_id AS artisanId, name, description, price, images,
              created_at AS createdAt, updated_at AS updatedAt
       FROM products WHERE id = ?`,
      created.lastID
    );

    const product = {
      ...row,
      _id: row.id,
      images: JSON.parse(row.images || '[]')
    };

    return sendSuccess(res, product, 201);
  })
);

router.get(
  '/products/mine',
  authRequired,
  requireRole('artisan', 'admin'),
  asyncHandler(async (req, res) => {
    const db = await getDb();
    const rows = await db.all(
      `SELECT p.id, p.artisan_id AS artisanId, p.name, p.description, p.price, p.images,
              p.created_at AS createdAt, p.updated_at AS updatedAt,
              u.name AS artisanName
       FROM products p
       LEFT JOIN users u ON u.id = p.artisan_id
       WHERE p.artisan_id = ?
       ORDER BY p.updated_at DESC, p.created_at DESC`,
      Number(req.user.id)
    );

    const items = rows.map((row) => ({
      _id: row.id,
      artisanId: {
        _id: row.artisanId,
        name: row.artisanName
      },
      name: row.name,
      description: row.description,
      price: row.price,
      images: JSON.parse(row.images || '[]'),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));

    return sendSuccess(res, { items });
  })
);

router.get(
  '/products',
  asyncHandler(async (req, res) => {
    const db = await getDb();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));
    const skip = (page - 1) * limit;

    const [rows, totalRow] = await Promise.all([
      db.all(
        `SELECT p.id, p.artisan_id AS artisanId, p.name, p.description, p.price, p.images,
                p.created_at AS createdAt, p.updated_at AS updatedAt,
                u.name AS artisanName
         FROM products p
         LEFT JOIN users u ON u.id = p.artisan_id
         ORDER BY p.created_at DESC
         LIMIT ? OFFSET ?`,
        limit,
        skip
      ),
      db.get('SELECT COUNT(*) AS total FROM products')
    ]);

    const items = rows.map((row) => ({
      _id: row.id,
      artisanId: {
        _id: row.artisanId,
        name: row.artisanName
      },
      name: row.name,
      description: row.description,
      price: row.price,
      images: JSON.parse(row.images || '[]'),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
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

router.get(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const db = await getDb();
    const id = parseId(req.params.id);

    if (!id) {
      return sendError(res, 'Invalid product id', 400);
    }

    const row = await db.get(
      `SELECT id, artisan_id AS artisanId, name, description, price, images,
              created_at AS createdAt, updated_at AS updatedAt
       FROM products WHERE id = ?`,
      id
    );

    const product = row
      ? {
          ...row,
          _id: row.id,
          images: JSON.parse(row.images || '[]')
        }
      : null;

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    return sendSuccess(res, product);
  })
);

router.put(
  '/products/:id',
  authRequired,
  requireRole('artisan', 'admin'),
  validateBody(updateProductSchema),
  asyncHandler(async (req, res) => {
    const db = await getDb();
    const id = parseId(req.params.id);

    if (!id) {
      return sendError(res, 'Invalid product id', 400);
    }

    const product = await db.get(
      `SELECT id, artisan_id AS artisanId, name, description, price, images,
              created_at AS createdAt, updated_at AS updatedAt
       FROM products WHERE id = ?`,
      id
    );

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    const isOwner = String(product.artisanId) === String(req.user.id);
    if (req.user.role !== 'admin' && !isOwner) {
      return sendError(res, 'Forbidden', 403);
    }

    const nextName = req.body.name ?? product.name;
    const nextDescription = req.body.description ?? product.description;
    const nextPrice = req.body.price ?? product.price;
    const nextImages = req.body.images ?? JSON.parse(product.images || '[]');

    await db.run(
      `UPDATE products
       SET name = ?, description = ?, price = ?, images = ?, updated_at = datetime('now')
       WHERE id = ?`,
      nextName,
      nextDescription,
      nextPrice,
      JSON.stringify(nextImages),
      id
    );

    const updated = await db.get(
      `SELECT id, artisan_id AS artisanId, name, description, price, images,
              created_at AS createdAt, updated_at AS updatedAt
       FROM products WHERE id = ?`,
      id
    );

    return sendSuccess(res, {
      ...updated,
      _id: updated.id,
      images: JSON.parse(updated.images || '[]')
    });
  })
);

router.delete(
  '/products/:id',
  authRequired,
  requireRole('artisan', 'admin'),
  asyncHandler(async (req, res) => {
    const db = await getDb();
    const id = parseId(req.params.id);

    if (!id) {
      return sendError(res, 'Invalid product id', 400);
    }

    const product = await db.get('SELECT id, artisan_id AS artisanId FROM products WHERE id = ?', id);

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    const isOwner = String(product.artisanId) === String(req.user.id);
    if (req.user.role !== 'admin' && !isOwner) {
      return sendError(res, 'Forbidden', 403);
    }

    await db.run('DELETE FROM products WHERE id = ?', id);

    return sendSuccess(res, { deleted: true });
  })
);

export default router;
