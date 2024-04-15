import type { DoneFuncWithErrOrRes, FastifyReply, FastifyRequest } from 'fastify';

// https://fastify.dev/docs/v2.15.x/Documentation/Hooks/#manage-errors-from-a-hook

export async function verifyJwt(
	req: FastifyRequest,
	reply: FastifyReply,
	done: DoneFuncWithErrOrRes
) {
	try {
		await req.jwtVerify({ onlyCookie: true });

		done();
	} catch (err) {
		return reply.status(401).send({ message: 'Unauthorized' });
	}
}
