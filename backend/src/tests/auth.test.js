import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

process.env.JWT_SECRET = 'test-secret';

import app from '../app.js';
import { closeTestDatabase, clearTestDatabase, connectTestDatabase } from './setup.js';

const TEST_PASSWORD = `Pwd!${Date.now()}_A`;

describe('Auth API', () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it('registers a user', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'Alice User',
      email: 'alice@example.com',
      password: TEST_PASSWORD,
      role: 'user'
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('alice@example.com');
    expect(response.body.data.token).toBeTruthy();
  });

  it('logs in and returns token', async () => {
    await request(app).post('/api/v1/auth/register').send({
      name: 'Bob Artisan',
      email: 'bob@example.com',
      password: TEST_PASSWORD,
      role: 'artisan'
    });

    const login = await request(app).post('/api/v1/auth/login').send({
      email: 'bob@example.com',
      password: TEST_PASSWORD
    });

    expect(login.statusCode).toBe(200);
    expect(login.body.success).toBe(true);
    expect(login.body.data.user.role).toBe('artisan');
    expect(login.body.data.token).toBeTruthy();
  });

  it('gets current profile from /auth/me', async () => {
    const register = await request(app).post('/api/v1/auth/register').send({
      name: 'Chris User',
      email: 'chris@example.com',
      password: TEST_PASSWORD,
      role: 'user'
    });

    const token = register.body.data.token;

    const me = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(me.statusCode).toBe(200);
    expect(me.body.success).toBe(true);
    expect(me.body.data.user.email).toBe('chris@example.com');
  });
});
