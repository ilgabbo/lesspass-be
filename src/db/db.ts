import { drizzle } from 'drizzle-orm/node-postgres';
import env from 'shared/env';
import * as schema from './schema';

const db = drizzle({ schema: schema, connection: env.DATABASE_URL });

export default db;
