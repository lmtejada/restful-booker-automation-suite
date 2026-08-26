import { test, expect } from '@playwright/test';

import {
    createBookingData,
    VALIDATION_SCENARIOS,
} from '@test-data/factories/booking-data.factory';

// Split so each loop's test body has a single, unconditional path — known-bug
// scenarios run via test.fail() and only assert status; the rest assert the
// full success shape. See docs/related/DEFECT-LOG.md for what's actually broken.
const knownBugScenarios = VALIDATION_SCENARIOS.filter(
    (scenario) => scenario.knownBug === true
);
const validScenarios = VALIDATION_SCENARIOS.filter(
    (scenario) => scenario.knownBug !== true
);

test.describe('booking validation', { tag: ['@api', '@regression'] }, () => {
    for (const scenario of knownBugScenarios) {
        test(
            `Validation: ${scenario.description}`,
            { tag: '@issues' },
            async ({ request }) => {
                test.fail(true, 'Known bug — see docs/related/DEFECT-LOG.md');

                const response = await request.post('/booking', {
                    data: createBookingData(scenario.overrides),
                });

                expect(response.status()).toBe(scenario.expectedStatus);
            }
        );
    }

    for (const scenario of validScenarios) {
        test(`Validation: ${scenario.description}`, async ({ request }) => {
            const response = await request.post('/booking', {
                data: createBookingData(scenario.overrides),
            });

            expect(response.status()).toBe(scenario.expectedStatus);
            const body = await response.json();
            expect(body.booking).toMatchObject(
                scenario.expectedBookingSubset ?? {}
            );
        });
    }
});
