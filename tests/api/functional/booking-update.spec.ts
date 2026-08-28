import { expect, test } from '@fixtures/index.fixture';

import {
    DEFAULT_BOOKING_DATA,
    generateBookingData,
} from '@test-data/factories/booking-data.factory';

test.describe(
    'update booking — PUT & PATCH /booking/:id',
    { tag: ['@api', '@regression'] },
    () => {
        let bookingId: number;

        test.beforeEach(async ({ bookingClient }) => {
            const response = await bookingClient.create(DEFAULT_BOOKING_DATA);
            const body = await response.json();
            bookingId = body.bookingid;
        });

        test(
            '[TC-019]: fully replaces a booking via PUT with a valid token',
            { tag: '@smoke' },
            async ({ bookingClient, authToken }) => {
                const updatedPayload = generateBookingData({
                    totalprice: 999,
                    additionalneeds: 'Late Checkout',
                });

                const response = await bookingClient.update(
                    bookingId,
                    updatedPayload,
                    authToken
                );

                expect(response.status()).toBe(200);
                const body = await response.json();
                expect(body).toMatchObject({ ...updatedPayload });
            }
        );

        test('[TC-020]: partially updates a booking via PATCH, leaving other fields intact', async ({
            bookingClient,
            authToken,
        }) => {
            const response = await bookingClient.partialUpdate(
                bookingId,
                { firstname: 'Updated' },
                authToken
            );

            expect(response.status()).toBe(200);
            const body = await response.json();

            expect(body.firstname).toBe('Updated');
            expect(body.lastname).toBe(DEFAULT_BOOKING_DATA.lastname);
            expect(body.totalprice).toBe(DEFAULT_BOOKING_DATA.totalprice);
        });

        test('[TC-021]: accepts Basic Auth as an alternative to the token cookie', async ({
            bookingClient,
        }) => {
            const basicAuth = Buffer.from(
                `${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}`
            ).toString('base64');

            const response = await bookingClient.updateWithOptions(bookingId, {
                headers: { Authorization: `Basic ${basicAuth}` },
                data: generateBookingData({ totalprice: 111 }),
            });

            expect(response.status()).toBe(200);
        });

        test('[TC-021]: succeeds with a valid Cookie token even when a fake Authorization header is also present', async ({
            bookingClient,
            authToken,
        }) => {
            const response = await bookingClient.updateWithOptions(bookingId, {
                headers: {
                    Cookie: `token=${authToken}`,
                    Authorization: 'Basic bm90LWFkbWluOndyb25n',
                },
                data: generateBookingData({ totalprice: 222 }),
            });

            expect(response.status()).toBe(200);
        });

        test('[TC-022]: rejects a PUT with an empty body instead of wiping the booking', async ({
            bookingClient,
            authToken,
        }) => {
            const response = await bookingClient.updateWithOptions(bookingId, {
                headers: { Cookie: `token=${authToken}` },
                data: {},
            });

            expect(response.status()).toBe(400);

            const verifyResponse = await bookingClient.getById(bookingId);
            const body = await verifyResponse.json();
            expect(body.firstname).toBe(DEFAULT_BOOKING_DATA.firstname);
        });

        test('[TC-023]: ignores unexpected extra fields on PUT', async ({
            bookingClient,
            authToken,
        }) => {
            const response = await bookingClient.updateWithOptions(bookingId, {
                headers: { Cookie: `token=${authToken}` },
                data: generateBookingData({ isAdmin: true }),
            });

            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body).not.toHaveProperty('isAdmin');
        });

        test('[TC-023]: ignores unexpected extra fields on PATCH', async ({
            bookingClient,
            authToken,
        }) => {
            const response = await bookingClient.partialUpdateWithOptions(
                bookingId,
                {
                    headers: { Cookie: `token=${authToken}` },
                    data: { firstname: 'Patched', isAdmin: true },
                }
            );

            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body).not.toHaveProperty('isAdmin');
        });

        test('[TC-024]: rejects a PUT request with no authorization', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.update(
                bookingId,
                DEFAULT_BOOKING_DATA
            );

            expect(response.status()).toBe(403);
        });

        test('[TC-024]: rejects a PATCH request with no authorization', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.partialUpdate(bookingId, {
                firstname: 'Nope',
            });

            expect(response.status()).toBe(403);
        });

        test('[TC-024]: rejects a PUT request with a malformed token', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.update(
                bookingId,
                DEFAULT_BOOKING_DATA,
                'not-a-real-token'
            );

            expect(response.status()).toBe(403);
        });

        test('[TC-024]: rejects a PUT request with a fake Authorization header', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.updateWithOptions(bookingId, {
                headers: { Authorization: 'Basic bm90LWFkbWluOndyb25n' },
                data: DEFAULT_BOOKING_DATA,
            });

            expect(response.status()).toBe(403);
        });

        test(
            '[TC-025]: updating a non-existent booking id returns 404, not 405',
            { tag: '@issues' },
            async ({ bookingClient, authToken }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-007)');

                const response = await bookingClient.update(
                    999999999,
                    DEFAULT_BOOKING_DATA,
                    authToken
                );

                expect(response.status()).toBe(404);
            }
        );
    }
);
