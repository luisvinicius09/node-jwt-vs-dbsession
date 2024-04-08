import { env } from '@/env';
import { FastifyReply, FastifyRequest } from 'fastify';
import { verify } from 'jsonwebtoken';

export async function verifyJwt(req: FastifyRequest, reply: FastifyReply) {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			return reply.status(401).send({ message: 'Unauthorized' });
		}

		const authToken = authHeader.split('Token ')[1];

		const payload = verify(authToken, env.JWT_SECRET);
		
		// set to request?
	} catch (err) {
		return reply.status(401).send({ message: 'Unauthorized' });
	}
}
