import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { env } from './env';

export const client = new Client({
	host: env.DATABASE_HOST,
	user: env.DATABASE_USERNAME,
	password: env.DATABASE_PASSWORD,
	database: env.DATABASE_DB,
	port: env.DATABASE_PORT,
});

export const db = drizzle(client, { schema });
