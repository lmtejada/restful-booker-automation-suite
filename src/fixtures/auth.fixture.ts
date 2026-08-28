import { request as apiRequest, test as base } from '@playwright/test';

import { getAuthToken } from '@utils/auth';
import { getEnv } from '@utils/config';

interface WorkerFixtures {
    authToken: string;
}

export const test = base.extend<object, WorkerFixtures>({
    authToken: [
        async ({}, use): Promise<void> => {
            const context = await apiRequest.newContext({
                baseURL: getEnv('API_URL'),
            });

            let token: string;

            try {
                // Attempt authentication; fall back to a single retry on failure
                token = await getAuthToken(context).catch(async (error) => {
                    // eslint-disable-next-line no-console
                    console.warn('Auth failure, retrying once...', error);
                    return await getAuthToken(context);
                });
            } finally {
                // Ensures context is always disposed of, even if both attempts fail
                await context.dispose();
            }

            await use(token);
        },
        { scope: 'worker' },
    ],
});

export { expect } from '@playwright/test';
