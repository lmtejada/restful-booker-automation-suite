import path from 'path';

import { Verifier } from '@pact-foundation/pact';
import { expect, request as apiRequest, test } from '@playwright/test';
import { layer } from 'allure-js-commons';

import { BookingClient } from '@clients/booking.client';
import { DEFAULT_BOOKING_DATA } from '@test-data/factories/booking-data.factory';
import { getEnv } from '@utils/config';

// Restful Booker is a public demo API we don't control the CI for. This runs the same
// verification a provider pipeline would, directly against the live API and the locally
// generated pact file, so a break still gets caught here.
test.describe('booking API provider verification', { tag: '@contract' }, () => {
    test.beforeEach(async () => {
        await layer('contract');
    });

    test('[TC-033]: the live Restful Booker API satisfies the consumer contract', async () => {
        const verifier = new Verifier({
            provider: 'Heroku-Booker-API',
            providerBaseUrl: getEnv('API_URL'),
            pactUrls: [
                path.resolve(
                    process.cwd(),
                    'src/contracts/pacts',
                    'Restful-Booker-Automation-Suite-Heroku-Booker-API.json'
                ),
            ],
            stateHandlers: {
                // Creates a real booking on the live API and hands its id
                // back so the pact's `fromProviderState('/booking/${id}', ...)`
                // path can be resolved to a booking that actually exists.
                'a booking exists': async (): Promise<{ id: number }> => {
                    const context = await apiRequest.newContext({
                        baseURL: getEnv('API_URL'),
                    });
                    const response = await new BookingClient(context).create(
                        DEFAULT_BOOKING_DATA
                    );
                    const body = await response.json();
                    await context.dispose();

                    return { id: body.bookingid };
                },
            },
        });

        // Resolves with an output summary if every interaction matched;
        // rejects (failing this test) the moment one doesn't.
        await expect(verifier.verifyProvider()).resolves.toBeDefined();
    });
});
