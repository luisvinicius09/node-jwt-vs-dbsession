import { Environment, vi } from 'vitest';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { env } from '@/env';
import * as schema from '@/schema';
import { resolve } from 'path';

export default <Environment>{
	name: 'drizzle',
	transformMode: 'ssr',

	async setup() {
		const pgContainer = await new PostgreSqlContainer()
			.withDatabase('testing_db')
			.withUsername('testing_db_user')
			.withPassword('testing_db_password')
			.start();

		process.env.DATABASE_PORT = pgContainer.getPort().toString();
		env.DATABASE_PORT = pgContainer.getPort();

		const migrationClient = postgres({
			host: pgContainer.getHost(),
			user: pgContainer.getUsername(),
			password: pgContainer.getPassword(),
			database: pgContainer.getDatabase(),
			port: pgContainer.getPort(),
		});

		await migrate(drizzle(migrationClient, { schema }), {
			migrationsFolder: resolve('./drizzle'),
		}).then(() => console.log('Migrations completed'));

		await migrationClient.end();

		// todo: seed database

		return {
			async teardown() {
				await pgContainer.stop();
			},
		};
	},
};
