import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';

async function bootstrap() {
  if (!env.jwtSecret) {
    throw new Error('Missing JWT_SECRET in environment variables');
  }

  await connectDatabase();

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API running on http://localhost:${env.port}`);
  });
}

try {
  await bootstrap();
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', error.message);
  process.exit(1);
}
