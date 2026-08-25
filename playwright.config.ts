import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

/**
 * Load environment variables from .env file.
 * Defaults to .env.dev if ENVIRONMENT is not set.
 *
 * Usage:
 *   ENVIRONMENT=staging npx playwright test
 */
const environment = process.env.ENVIRONMENT ?? 'dev';
const environmentPath = `.env.${environment}`;

dotenv.config({ path: environmentPath });

/**
 * Playwright Test Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './tests',

    /* Run tests in files in parallel */
    fullyParallel: true,

    /* Fail the build on CI if you accidentally left test.only in the source code */
    forbidOnly: !!process.env.CI,

    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,

    /* Limit parallel workers on CI for stability */
    workers: process.env.CI ? 1 : undefined,

    /* Reporter configuration */
    reporter: [
        ['list'], // Terminal summary reporter
        [
            'allure-playwright',
            {
                resultsDir: 'reports/allure-results',
                detail: true,
                suiteTitle: true,
                globalLabels: {
                    layer: 'api',
                },
            },
        ],
    ],

    /* Trace/screenshot/video artifacts for failed tests */
    outputDir: 'reports/test-results',

    /*
     * Shared settings for all projects. No `devices[...]` spread and no
     * browserName anywhere in this file because this is an API-only suite
     * that uses the `request` fixture exclusively.
     */
    use: {
        // Base endpoint URL for relative path resolution in tests
        baseURL: process.env.API_URL,

        // Common HTTP headers sent with every request
        extraHTTPHeaders: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },

        // Request timeout duration
        actionTimeout: 10000,

        // Enable tracing for failed tests to help in debugging
        trace: 'retain-on-failure',
    },

    /* Test timeout */
    timeout: 30000,

    /* Expect timeout */
    expect: {
        timeout: 10000,
    },

    projects: [
        {
            name: 'restful-booker-api',
        },
    ],
});
