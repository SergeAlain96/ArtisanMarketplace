export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  sqliteDbPath: process.env.SQLITE_DB_PATH || './data/marketplace.sqlite',
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtIssuer: process.env.JWT_ISSUER || 'artisan-marketplace-api',
  jwtAudience: process.env.JWT_AUDIENCE || 'artisan-marketplace-web',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  apiRateLimitWindowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS || 900000),
  apiRateLimitMax: Number(process.env.API_RATE_LIMIT_MAX || 300),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100)
};
