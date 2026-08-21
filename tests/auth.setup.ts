/**
 * auth.setup.ts
 * Logs in to SauceDemo via the UI once and saves the resulting storage
 * state so the main test suite can start already authenticated.
 */

import { test, expect } from '@playwright/test';

import { StorageStatePaths } from '@enums/app';
import { getEnv } from '@utils/config';

test.describe('auth setup', () => {
    test('authenticate as standard user', async ({ page }) => {
        const appUrl = getEnv('APP_URL');
        const username = getEnv('USER_NAME');
        const password = getEnv('USER_PASSWORD');

        await page.goto(appUrl);

        await page.getByTestId('username').fill(username);
        await page.getByTestId('password').fill(password);
        await page.getByTestId('login-button').click();

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(page.getByTestId('inventory-container')).toBeVisible();

        await page.context().storageState({ path: StorageStatePaths.APP });
    });
});
