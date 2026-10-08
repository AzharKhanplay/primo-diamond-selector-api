import dotenv from 'dotenv';

dotenv.config();

function parseOrigins(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const config = {
  port: Number(process.env.PORT || 8787),
  nodeEnv: process.env.NODE_ENV || 'development',
  provider: (process.env.DIAMOND_PROVIDER || 'mock').toLowerCase(),
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
  cacheTtlSeconds: Number(process.env.DIAMOND_CACHE_TTL || 60),
  nivoda: {
    apiUrl: process.env.NIVODA_API_URL || '',
    username: process.env.NIVODA_USERNAME || '',
    password: process.env.NIVODA_PASSWORD || '',
    clientId: process.env.NIVODA_CLIENT_ID || '',
    clientSecret: process.env.NIVODA_CLIENT_SECRET || '',
    apiKey: process.env.NIVODA_API_KEY || '',
  },
};

export function isNivodaConfigured() {
  const { apiUrl, username, password } = config.nivoda;
  return Boolean(apiUrl && username && password);
}
