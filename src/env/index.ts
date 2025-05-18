import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw Error('No database url found');
}
if (!process.env.SERVER_PUBLIC_KEY || !process.env.SERVER_PRIVATE_KEY) {
  throw Error('No pair key found');
}

const env = {
  API_PORT: process.env.API_PORT ?? 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  SERVER_PUBLIC_KEY: process.env.SERVER_PUBLIC_KEY,
  SERVER_PRIVATE_KEY: process.env.SERVER_PRIVATE_KEY,
} as const;

export default env;
