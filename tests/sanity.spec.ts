import { test, expect } from '@playwright/test';

test.describe('framework sanity check', { tag: '@smoke' }, () => {
    test('[Smoke]: playwright test runner initializes successfully', async () => {
        expect(true).toBe(true);
    });

    test('[Smoke]: API engine verification - healthcheck', async ({
        request,
    }) => {
        const response = await request.get('/ping');
        expect(response.status()).toBe(201);
    });
});
