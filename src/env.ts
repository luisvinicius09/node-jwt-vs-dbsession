import { config } from 'dotenv';
import { resolve } from 'path';
import { z } from 'zod';

config({ path: resolve(`./.env${process.env.NODE_ENV === 'test' ? '.test' : ''}`) });

const envSchema = z.object({
	NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
	PORT: z.coerce.number().default(3333),
	DATABASE_USERNAME: z.string(),
	DATABASE_PASSWORD: z.string(),
	DATABASE_DB: z.string(),
	DATABASE_PORT: z.coerce.number().default(5432),
	DATABASE_HOST: z.string(),
	JWT_SECRET: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
	console.error('❌ Invalid environment variables', _env.error.format());

	throw new Error('Invalid environment variables');
}

export const env = _env.data;
