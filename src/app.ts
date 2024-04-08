import fastify from 'fastify';
import { z } from 'zod';
import { db } from './database';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { env } from './env';
import { verifyJwt } from './middlewares/verify-jwt';
import cookie from '@fastify/cookie';

export const app = fastify();

app.register(cookie, {
	secret: 'my-secret-42321',
});

app.get('/', (req, reply) => {
	return reply.send({ message: 'Hello to new free world' });
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
			.status(400)
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

app.post('/login-with-jwt', async (req, reply) => {
	const registerUserSchema = z.object({
		email: z.string().email(),
		password: z.string(),
	});

	const body = registerUserSchema.safeParse(req.body);

	if (!body.success) {
		console.error('Invalid register user body.', body.error.format());

		return reply
			.status(400)
			.send({ message: 'Invalid register user body.', errors: body.error.format() });
	}

	const { email, password } = body.data;

	const [user] = await db.select().from(users).where(eq(users.email, email));

	if (!user) {
		return reply.status(404).send({ message: 'Email or password invalid!' });
	}

	const passwordMatches = await compare(password, user.password);

	if (!passwordMatches) {
		return reply.status(400).send({ message: 'Email or password invalid!' });
	}

	const token = sign({ name: user.name, email: user.email, issueAt: Date.now() }, env.JWT_SECRET, {
		expiresIn: '60 * 60',
	});

	return reply.send({ message: 'Logged In!' }).setCookie('Authorization', `Bearer ${token}`, {
		httpOnly: true,
		secure: true,
	});
});

app.get('/dashboard', { onRequest: [verifyJwt] }, async (req, reply) => {
	return reply.send({ message: 'Logged In!', secretStuff: 'Wow dashboard data' });
});
