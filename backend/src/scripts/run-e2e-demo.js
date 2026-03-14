import 'dotenv/config';
import request from 'supertest';
import app from '../app.js';
import { connectDatabase, getDb } from '../config/db.js';

function uniqueEmail(prefix) {
  const stamp = Date.now();
  return `${prefix}.${stamp}@demo.local`;
}

async function run() {
  await connectDatabase();
  const db = await getDb();

  const artisanEmail = uniqueEmail('artisan');
  const userEmail = uniqueEmail('user');

  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || '';

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  }

  const artisanRegister = await request(app).post('/api/v1/auth/register').send({
    name: 'Demo Artisan',
    email: artisanEmail,
    password: 'DemoPass123',
    role: 'artisan'
  });

  const userRegister = await request(app).post('/api/v1/auth/register').send({
    name: 'Demo User',
    email: userEmail,
    password: 'DemoPass123',
    role: 'user'
  });

  const artisanToken = artisanRegister.body?.data?.token;
  const artisanId = artisanRegister.body?.data?.user?.id;
  const userToken = userRegister.body?.data?.token;

  const artisanProfile = await request(app)
    .post('/api/v1/artisan/profile')
    .set('Authorization', `Bearer ${artisanToken}`)
    .send({
      bio: 'Artisan profile created by e2e demo',
      location: 'Paris',
      avatarUrl: ''
    });

  const createProduct = await request(app)
    .post('/api/v1/products')
    .set('Authorization', `Bearer ${artisanToken}`)
    .send({
      name: 'Demo Product',
      description: 'SQLite end-to-end validation product',
      price: 29.9,
      images: []
    });

  const productId = createProduct.body?.data?._id;

  const createRating = await request(app)
    .post('/api/v1/ratings')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      artisanId: String(artisanId),
      rating: 5,
      comment: 'Excellent travail!'
    });

  const adminLogin = await request(app).post('/api/v1/auth/login').send({
    email: adminEmail,
    password: adminPassword
  });

  const adminToken = adminLogin.body?.data?.token;

  const adminArtisans = await request(app)
    .get('/api/v1/admin/artisans?page=1&limit=5&search=demo')
    .set('Authorization', `Bearer ${adminToken}`);

  const adminDeleteProduct = await request(app)
    .delete(`/api/v1/admin/product/${productId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  const summary = {
    artisanRegister: artisanRegister.statusCode,
    userRegister: userRegister.statusCode,
    artisanProfile: artisanProfile.statusCode,
    createProduct: createProduct.statusCode,
    createRating: createRating.statusCode,
    adminLogin: adminLogin.statusCode,
    adminArtisans: adminArtisans.statusCode,
    adminDeleteProduct: adminDeleteProduct.statusCode,
    sampleIds: {
      artisanId,
      productId
    }
  };

  await db.close();

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(summary, null, 2));
}

run().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error('E2E demo failed:', error.message);
  process.exit(1);
});
