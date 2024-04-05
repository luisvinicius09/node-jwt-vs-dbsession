import fastify from 'fastify';
import { z } from 'zod';
import { db } from './database';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcrypt';

export const app = fastify();

app.get('/', (req, reply) => {
	return reply.send({ message: 'Hello to new world' });
});

app.post('/register-user', async (req, reply) => {
	const registerUserSchema = z.object({
		name: z.string(),
		email: z.string().email(),
		password: z.string(),
	});

	const body = registerUserSchema.safeParse(req.body);

	if (!body.success) {
		console.error('Invalid register user body.', body.error.format());

		return reply
			.status(404)
			.send({ message: 'Invalid register user body.', errors: body.error.format() });
	}

	const { email, password, name } = body.data;

	const userExists = await db.select().from(users).where(eq(users.email, email));

	if (userExists) {
		return reply.status(400).send({ message: 'Email already exists' });
	}

	await db.insert(users).values({ email: email, name: name, password: await hash(password, 10) });

	const user = db
		.select({
			id: users.id,
			email: users.email,
			name: users.name,
			createdAt: users.createdAt,
			updatedAt: users.updatedAt,
		})
		.from(users)
		.where(eq(users.email, email));

	return reply.send({ message: 'success', user });
});
