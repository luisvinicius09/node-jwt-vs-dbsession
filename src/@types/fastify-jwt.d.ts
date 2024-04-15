import '@fastify/jwt';

declare module '@fastify/jwt' {
	export interface FastifyJWT {
		payload: {};
		user: {
			name: string | null;
			issueAt: number;
			sub: string;
		};
	}
}
