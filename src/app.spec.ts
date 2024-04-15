import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from './app';
import { client } from './database';

const USERNAME = 'John Doe';
const USEREMAIL = 'johndoe@email.com';
const USERPASSWORD = 'johndoe-pw';

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
		const response = await request(app.server).get('/feed').send();

		expect(response.status).toBe(200);
		expect(response.body.message).toEqual('Hello to new free world');
	});

	describe('user', () => {
		it('should succefully register a user', async () => {
			const response = await request(app.server).post('/register-user').send({
				name: USERNAME,
				email: USEREMAIL,
				password: USERPASSWORD,
			});

			expect(response.status).toBe(200);
			expect(response.body.user.email).toEqual(USEREMAIL);
		});

		it('should succefully login', async () => {
			const loginResponse = await request(app.server).post('/login-with-jwt').send({
				email: USEREMAIL,
				password: USERPASSWORD,
			});

			console.log('headers', loginResponse.headers);

			expect(loginResponse.status).toBe(200);
			expect(loginResponse.body).toMatchObject({
				access_token: expect.any(String),
				token_type: 'Bearer',
				expires_in: expect.any(String),
				refresh_token: expect.any(String)
			});
		});
	});
});
