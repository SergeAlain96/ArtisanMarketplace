import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDatabase, getDb } from '../config/db.js';

async function seedAdmin() {
  const name = process.env.ADMIN_NAME || 'Platform Admin';
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  }

  await connectDatabase();
  const db = await getDb();

  const passwordHash = await bcrypt.hash(password, 10);

  await db.run(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES (?, ?, ?, 'admin')
     ON CONFLICT(email) DO UPDATE SET
       name = excluded.name,
       password_hash = excluded.password_hash,
       role = 'admin'`,
    name,
    email,
    passwordHash
  );

  const admin = await db.get('SELECT email FROM users WHERE email = ?', email);

  // eslint-disable-next-line no-console
  console.log(`Admin seeded: ${admin.email}`);
  process.exit(0);
}

try {
  await seedAdmin();
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', error.message);
  process.exit(1);
}
