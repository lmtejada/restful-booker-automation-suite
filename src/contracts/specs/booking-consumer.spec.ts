import path from 'path';

import { MatchersV3, PactV3 } from '@pact-foundation/pact';
import { expect, test } from '@playwright/test';
import { layer } from 'allure-js-commons';

import { AuthClient } from '@clients/auth.client';
import { BookingClient } from '@clients/booking.client';
import { DEFAULT_BOOKING_DATA } from '@test-data/factories/booking-data.factory';
import { DEFAULT_CREDENTIALS } from '@utils/auth';
import {
    JSON_RESPONSE_HEADERS,
    bookingBodyMatcher,
    withMockClient,
} from '@utils/contract-helpers';

const provider = new PactV3({
    consumer: 'Restful-Booker-Automation-Suite',
    provider: 'Heroku-Booker-API',
    dir: path.resolve(process.cwd(), 'src/contracts/pacts'),
});

test.describe('booking API consumer contract', { tag: '@contract' }, () => {
    test.beforeEach(async () => {
        await layer('contract');
    });

    test('[TC-033]: authenticates with valid credentials', async () => {
        provider
            .uponReceiving('a request to authenticate with valid credentials')
            .withRequest({
                method: 'POST',
                path: '/auth',
                headers: { 'Content-Type': 'application/json' },
                body: DEFAULT_CREDENTIALS,
            })
            .willRespondWith({
                status: 200,
                headers: JSON_RESPONSE_HEADERS,
                body: {
                    token: MatchersV3.like('abc123cbaz'),
                },
            });

        await provider.executeTest((mockServer) =>
            withMockClient(mockServer, async (context) => {
                const authClient = new AuthClient(context);
                const response = await authClient.login(DEFAULT_CREDENTIALS);

                expect(response.status()).toBe(200);
                const body = await response.json();
                expect(body).toHaveProperty('token');
            })
        );
    });

    test('[TC-033]: creates a booking matching the expected response schema', async () => {
        provider
            .uponReceiving('a request to create a new booking')
            .withRequest({
                method: 'POST',
                path: '/booking',
                headers: { 'Content-Type': 'application/json' },
                body: DEFAULT_BOOKING_DATA,
            })
            .willRespondWith({
                status: 200,
                headers: JSON_RESPONSE_HEADERS,
                body: {
                    bookingid: MatchersV3.integer(1),
                    booking: {
                        ...bookingBodyMatcher(DEFAULT_BOOKING_DATA),
                        additionalneeds: MatchersV3.like(
                            DEFAULT_BOOKING_DATA.additionalneeds
                        ),
                    },
                },
            });

        await provider.executeTest((mockServer) =>
            withMockClient(mockServer, async (context) => {
                const bookingClient = new BookingClient(context);
                const response =
                    await bookingClient.create(DEFAULT_BOOKING_DATA);

                expect(response.status()).toBe(200);
                const body = await response.json();

                expect(body).toHaveProperty('bookingid');
                expect(body.booking.firstname).toBe(
                    DEFAULT_BOOKING_DATA.firstname
                );
            })
        );
    });

    test('[TC-033]: retrieves an existing booking by id', async () => {
        provider
            // No fixed id — the provider-side handler creates a real booking
            // and injects its id via fromProviderState below, since this API
            // is shared/mutating with no seed or reset endpoint (see CLAUDE.md).
            .given('a booking exists')
            .uponReceiving('a request for an existing booking by id')
            .withRequest({
                method: 'GET',
                path: MatchersV3.fromProviderState(
                    '/booking/${id}',
                    '/booking/1'
                ),
                headers: { Accept: 'application/json' },
            })
            .willRespondWith({
                status: 200,
                headers: JSON_RESPONSE_HEADERS,
                body: bookingBodyMatcher(DEFAULT_BOOKING_DATA),
            });

        await provider.executeTest((mockServer) =>
            withMockClient(mockServer, async (context) => {
                const bookingClient = new BookingClient(context);
                const response = await bookingClient.getById(1);

                expect(response.status()).toBe(200);
                const body = await response.json();

                expect(body).toHaveProperty('firstname');
                expect(body.firstname).toBe(DEFAULT_BOOKING_DATA.firstname);
            })
        );
    });
});
