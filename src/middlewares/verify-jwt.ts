import type { DoneFuncWithErrOrRes, FastifyReply, FastifyRequest } from 'fastify';

// https://fastify.dev/docs/v2.15.x/Documentation/Hooks/#manage-errors-from-a-hook

export async function verifyJwt(
	req: FastifyRequest,
	reply: FastifyReply,
	done: DoneFuncWithErrOrRes
) {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			return reply
				.status(401)
				.send({ message: 'Unauthorized', error: 'Missing Authorization Header' });
		}

		await req.jwtVerify();

		done();
	} catch (err) {
		return reply.status(401).send({ message: 'Unauthorized' });
	}
}
