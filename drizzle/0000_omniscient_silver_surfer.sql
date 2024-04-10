CREATE TABLE IF NOT EXISTS "nodejs-tests-db-users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "nodejs-tests-db-users_id_unique" UNIQUE("id"),
	CONSTRAINT "nodejs-tests-db-users_email_unique" UNIQUE("email")
);
