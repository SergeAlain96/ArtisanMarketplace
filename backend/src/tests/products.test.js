import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

process.env.JWT_SECRET = 'test-secret';

import app from '../app.js';
import { closeTestDatabase, clearTestDatabase, connectTestDatabase } from './setup.js';

const TEST_PASSWORD = `Pwd!${Date.now()}_B`;

async function registerAndLogin({ name, email, password, role }) {
  await request(app).post('/api/v1/auth/register').send({ name, email, password, role });
  const login = await request(app).post('/api/v1/auth/login').send({ email, password });
  return login.body.data.token;
}

describe('Products API', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    await connectTestDatabase();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it('allows artisan to create a product', async () => {
    const artisanToken = await registerAndLogin({
      name: 'Maya Artisan',
      email: 'maya@example.com',
      password: TEST_PASSWORD,
      role: 'artisan'
    });

    const created = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${artisanToken}`)
      .send({
        name: 'Handmade Vase',
        description: 'A white ceramic handmade vase',
        price: 50,
        images: []
      });

    expect(created.statusCode).toBe(201);
    expect(created.body.success).toBe(true);
    expect(created.body.data.name).toBe('Handmade Vase');
  });

  it('forbids basic user from creating product', async () => {
    const userToken = await registerAndLogin({
      name: 'Nina User',
      email: 'nina@example.com',
      password: TEST_PASSWORD,
      role: 'user'
    });

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Not Allowed',
        description: 'Should fail',
        price: 10
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });
});
