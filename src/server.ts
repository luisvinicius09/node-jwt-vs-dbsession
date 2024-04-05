import { app } from '@/app';
import { client } from './database';
import { env } from './env';

async function main() {
	await client.connect().then(() => console.log('Connected to database!'));

	app
		.listen({
			host: '0.0.0.0',
			port: env.PORT,
		})
		.then(() => console.log('🎉 Server is running!'));
}

main();
