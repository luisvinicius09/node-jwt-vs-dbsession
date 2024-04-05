import { pgTableCreator, timestamp, varchar } from 'drizzle-orm/pg-core';

export const pgTable = pgTableCreator((name) => `nodejs-tests-db-${name}`);

export const users = pgTable('users', {
	id: varchar('id').unique().notNull().primaryKey(),
	name: varchar('name'),
	email: varchar('email').unique().notNull(),
	password: varchar('password').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
});

// export const sessions = pgTable('sessions', {});
