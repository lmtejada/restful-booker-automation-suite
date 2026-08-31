import { expect, test } from '@fixtures/app.fixture';

import { DEFAULT_CREDENTIALS } from '@utils/auth';
import { AUTH_PATH } from '@utils/constants';

test.describe(
    'authentication — POST /auth',
    { tag: ['@api', '@regression'] },
    () => {
        test(
            '[TC-001]: valid credentials return a token',
            { tag: '@smoke' },
            async ({ authClient }) => {
                const response = await authClient.login(DEFAULT_CREDENTIALS);

                expect(response.status()).toBe(200);
                const body = await response.json();

                expect(body.token).toEqual(expect.any(String));
                expect(body.token.length).toBeGreaterThan(0);
            }
        );

        test('[TC-002]: rejects an incorrect password', async ({
            authClient,
        }) => {
            const response = await authClient.login({
                ...DEFAULT_CREDENTIALS,
                password: 'wrong-password',
            });

            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body).toEqual({ reason: 'Bad credentials' });
        });

        test('[TC-002]: rejects an incorrect username', async ({
            authClient,
        }) => {
            const response = await authClient.login({
                ...DEFAULT_CREDENTIALS,
                username: 'new-user',
            });

            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body).toEqual({ reason: 'Bad credentials' });
        });

        test('[TC-002]: rejects a request missing the username field', async ({
            authClient,
        }) => {
            const response = await authClient.login({
                password: DEFAULT_CREDENTIALS.password,
            });

            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body).toEqual({ reason: 'Bad credentials' });
        });

        test('[TC-002]: rejects a request missing the password field', async ({
            authClient,
        }) => {
            const response = await authClient.login({
                username: DEFAULT_CREDENTIALS.username,
            });

            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body).toEqual({ reason: 'Bad credentials' });
        });

        test(
            '[TC-003]: returns 415 for a non-JSON Content-Type instead of a misleading Bad credentials',
            { tag: '@issues' },
            async ({ authClient }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-010)');

                const response = await authClient.loginWithOptions({
                    headers: { 'Content-Type': 'text/plain' },
                    data: JSON.stringify(DEFAULT_CREDENTIALS),
                });

                expect(response.status()).toBe(415);
            }
        );

        test('[TC-004]: rejects unsupported HTTP methods', async ({
            request,
        }) => {
            const response = await request.get(AUTH_PATH);

            expect(response.status()).toBe(404);
        });
    }
);
