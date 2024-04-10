import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from './app';
import { env } from './env';
import { client } from './database';

describe('App', () => {
	beforeAll(async () => {
		await client.connect();

		await app.ready();
	});

	afterAll(async () => {
		await client.end();

		await app.close();
	});

	it('should display welcome message', async () => {
		const response = await request(app.server).get('/').send();

		expect(response.status).toBe(200);
		expect(response.body.message).toEqual('Hello to new free world');
	});
});
