import fastify from 'fastify';
import { z } from 'zod';
import { db } from './database';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import { compare, hash } from 'bcrypt';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { env } from './env';
import { verifyJwt } from './middlewares/verify-jwt';
import cookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import view from '@fastify/view';
import pug from 'pug';

export const app = fastify();

app.register(cookie, {
	secret: 'my-secret-42321',
});

app.register(fastifyJwt, {
	secret: env.JWT_SECRET,
});

app.register(view, {
	engine: {
		pug: pug,
	},
});

app.get('/', (req, reply) => {
	return reply.view('./views/index.pug');
});

app.get('/feed', (req, reply) => {
	console.log(req.cookies);

	return reply.send({ message: 'Hello to new free world' });
});

app.post('/register-user', async (req, reply) => {
	const registerUserSchema = z.object({
		name: z.string(),
		email: z.string().email(),
		password: z.string(),
	});

	try {
		const body = registerUserSchema.safeParse(req.body);

		if (!body.success) {
			console.error('Invalid register user body.', body.error.format());

			return reply
				.status(400)
				.send({ message: 'Invalid register user body.', errors: body.error.format() });
		}

		const { email, password, name } = body.data;

		const [userExists] = await db.select().from(users).where(eq(users.email, email));

		if (userExists) {
			return reply.status(400).send({ message: 'Email already exists' });
		}

		await db.insert(users).values({ email: email, name: name, password: await hash(password, 10) });

		const [user] = await db
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
	} catch (err) {
		console.error(err);

		return reply.status(500).send({ message: 'Internal server error' });
	}
});

app.post('/login-with-jwt', async (req, reply) => {
	const registerUserSchema = z.object({
		email: z.string().email(),
		password: z.string(),
	});

	try {
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

		const token = await reply.jwtSign(
			{ name: user.name, issueAt: Date.now() },
			{
				sign: { expiresIn: '1h', sub: user.id.toString() },
			}
		);

		const refreshToken = await reply.jwtSign(
			{ name: user.name, issueAt: Date.now() },
			{
				sign: { expiresIn: '7d', sub: user.id.toString() },
			}
		);

		// return reply
		// 	.setCookie('Authorization', `Bearer ${token}`, {
		// 		httpOnly: true,
		// 		secure: true,
		// 		signed: true,
		// 	})
		// 	.send({ message: 'Logged In!' });

		return reply.send({
			access_token: token,
			token_type: 'Bearer',
			expires_in: '3600',
			refresh_token: refreshToken,
		});
	} catch (err) {
		console.error(err);

		return reply.status(500).send({ message: 'Internal server error' });
	}
});

app.post('/refresh-token', { onRequest: [verifyJwt] }, async (req, reply) => {
	//! Can save refresh token on database for future invalidations.
	const { name, sub } = req.user;

	const token = await reply.jwtSign(
		{ name: name, issueAt: Date.now() },
		{
			sign: { expiresIn: '1h', sub: sub },
		}
	);

	const refreshToken = await reply.jwtSign(
		{ name: name, issueAt: Date.now() },
		{
			sign: { expiresIn: '7d', sub: sub },
		}
	);

	return reply.send({
		access_token: token,
		token_type: 'Bearer',
		expires_in: '3600',
		refresh_token: refreshToken,
	});
});

app.get('/dashboard', { onRequest: [verifyJwt] }, async (req, reply) => {
	return reply.send({ message: 'Logged In!', secretStuff: 'Wow dashboard data' });
});
