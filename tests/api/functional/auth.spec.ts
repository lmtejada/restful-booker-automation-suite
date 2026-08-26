import { expect, test } from '@playwright/test';

import { DEFAULT_CREDENTIALS } from '@utils/auth';

test.describe(
    'authentication — POST /auth',
    { tag: ['@api', '@regression'] },
    () => {
        test(
            '[Smoke] valid credentials return a token',
            { tag: '@smoke' },
            async ({ request }) => {
                const response = await request.post('/auth', {
                    data: DEFAULT_CREDENTIALS,
                });

                expect(response.status()).toBe(200);
                const body = await response.json();

                expect(body.token).toEqual(expect.any(String));
                expect(body.token.length).toBeGreaterThan(0);
            }
        );

        test('rejects an incorrect password', async ({ request }) => {
            const response = await request.post('/auth', {
                data: { ...DEFAULT_CREDENTIALS, password: 'wrong-password' },
            });

            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body).toEqual({ reason: 'Bad credentials' });
        });

        test('rejects an incorrect username', async ({ request }) => {
            const response = await request.post('/auth', {
                data: { ...DEFAULT_CREDENTIALS, username: 'new-user' },
            });

            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body).toEqual({ reason: 'Bad credentials' });
        });

        test('rejects a request missing the username field', async ({
            request,
        }) => {
            const response = await request.post('/auth', {
                data: { password: DEFAULT_CREDENTIALS.password },
            });

            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body).toEqual({ reason: 'Bad credentials' });
        });

        test('rejects a request missing the password field', async ({
            request,
        }) => {
            const response = await request.post('/auth', {
                data: { username: DEFAULT_CREDENTIALS.username },
            });

            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body).toEqual({ reason: 'Bad credentials' });
        });

        test(
            'returns 415 for a non-JSON Content-Type instead of a misleading Bad credentials',
            { tag: '@issues' },
            async ({ request }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-010)');

                const response = await request.post('/auth', {
                    headers: { 'Content-Type': 'text/plain' },
                    data: JSON.stringify(DEFAULT_CREDENTIALS),
                });

                expect(response.status()).toBe(415);
            }
        );

        test('rejects unsupported HTTP methods', async ({ request }) => {
            const response = await request.get('/auth');

            expect(response.status()).toBe(404);
        });
    }
);
