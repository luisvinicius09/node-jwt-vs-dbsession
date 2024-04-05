import { env } from '@/env';
import type { Config } from 'drizzle-kit';

export default {
	schema: './src/schema.ts',
	out: './drizzle',
	driver: 'pg',
	dbCredentials: {
		host: env.DATABASE_HOST,
		user: env.DATABASE_USERNAME,
		password: env.DATABASE_PASSWORD,
		database: env.DATABASE_DB,
		port: env.DATABASE_PORT,
	},
} satisfies Config;
