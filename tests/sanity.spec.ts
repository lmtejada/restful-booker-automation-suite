import { test, expect } from '@playwright/test';

test.describe(
    'framework sanity check',
    { tag: ['@smoke', '@e2e', '@a11y'] },
    () => {
        test('[Smoke]: playwright test runner initializes successfully', async () => {
            expect(true).toBe(true);
        });
    }
);
