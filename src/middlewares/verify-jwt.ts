import { env } from '@/env';
import type { DoneFuncWithErrOrRes, FastifyReply, FastifyRequest } from 'fastify';
import { verify } from 'jsonwebtoken';

// https://fastify.dev/docs/v2.15.x/Documentation/Hooks/#manage-errors-from-a-hook

export async function verifyJwt(
	req: FastifyRequest,
	reply: FastifyReply,
	done: DoneFuncWithErrOrRes
) {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			return reply.status(401).send({ message: 'Unauthorized' });
		}

		const authToken = authHeader.split('Token ')[1];

		const payload = verify(authToken, env.JWT_SECRET);

		// set to request?
		done();
	} catch (err) {
		return reply.status(401).send({ message: 'Unauthorized' });
	}
}
