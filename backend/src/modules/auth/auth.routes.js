import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { validateBody } from '../../middlewares/validate.middleware.js';
import { authRequired } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../common/async-handler.js';
import { sendError, sendSuccess } from '../../common/response.js';
import { env } from '../../config/env.js';
import { getDb } from '../../config/db.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/\d/, 'Password must include at least one number'),
  role: z.enum(['artisan', 'user']).default('user')
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72)
});

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      role: user.role
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
      issuer: env.jwtIssuer,
      audience: env.jwtAudience,
      algorithm: 'HS256'
    }
  );
}

router.post(
  '/register',
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    const db = await getDb();

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', normalizedEmail);
    if (existingUser) {
      return sendError(res, 'Email already in use', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await db.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      name,
      normalizedEmail,
      passwordHash,
      role
    );

    const user = await db.get('SELECT id, name, email, role FROM users WHERE id = ?', created.lastID);

    const token = signAccessToken(user);

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      201
    );
  })
);

router.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const db = await getDb();

    const user = await db.get(
      'SELECT id, name, email, role, password_hash AS passwordHash FROM users WHERE email = ?',
      email.toLowerCase().trim()
    );
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const token = signAccessToken(user);

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  })
);

router.get(
  '/me',
  authRequired,
  asyncHandler(async (req, res) => {
    const db = await getDb();
    const user = await db.get(
      'SELECT id, name, email, role, created_at AS createdAt FROM users WHERE id = ?',
      Number(req.user.id)
    );

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  })
);

export default router;
