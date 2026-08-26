import { expect, test } from '@fixtures/auth.fixture';

import { DEFAULT_BOOKING_DATA } from '@test-data/factories/booking-data.factory';

test.describe(
    'update booking — PUT & PATCH /booking/:id',
    { tag: ['@api', '@regression'] },
    () => {
        let bookingId: number;

        test.beforeEach(async ({ request }) => {
            const response = await request.post('/booking', {
                data: DEFAULT_BOOKING_DATA,
            });
            const body = await response.json();
            bookingId = body.bookingid;
        });

        test(
            '[Smoke] fully replaces a booking via PUT with a valid token',
            { tag: '@smoke' },
            async ({ request, authToken }) => {
                const updatedPayload = {
                    ...DEFAULT_BOOKING_DATA,
                    totalprice: 999,
                    additionalneeds: 'Late Checkout',
                };

                const response = await request.put(`/booking/${bookingId}`, {
                    headers: { Cookie: `token=${authToken}` },
                    data: updatedPayload,
                });

                expect(response.status()).toBe(200);
                const body = await response.json();
                expect(body).toMatchObject(updatedPayload);
            }
        );

        test('partially updates a booking via PATCH, leaving other fields intact', async ({
            request,
            authToken,
        }) => {
            const response = await request.patch(`/booking/${bookingId}`, {
                headers: { Cookie: `token=${authToken}` },
                data: { firstname: 'Updated' },
            });

            expect(response.status()).toBe(200);
            const body = await response.json();

            expect(body.firstname).toBe('Updated');
            expect(body.lastname).toBe(DEFAULT_BOOKING_DATA.lastname);
            expect(body.totalprice).toBe(DEFAULT_BOOKING_DATA.totalprice);
        });

        test('accepts Basic Auth as an alternative to the token cookie', async ({
            request,
        }) => {
            const basicAuth = Buffer.from(
                `${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}`
            ).toString('base64');

            const response = await request.put(`/booking/${bookingId}`, {
                headers: { Authorization: `Basic ${basicAuth}` },
                data: { ...DEFAULT_BOOKING_DATA, totalprice: 111 },
            });

            expect(response.status()).toBe(200);
        });

        test('rejects a PUT request with no authorization', async ({
            request,
        }) => {
            const response = await request.put(`/booking/${bookingId}`, {
                data: DEFAULT_BOOKING_DATA,
            });

            expect(response.status()).toBe(403);
        });

        test('rejects a PATCH request with no authorization', async ({
            request,
        }) => {
            const response = await request.patch(`/booking/${bookingId}`, {
                data: { firstname: 'Nope' },
            });

            expect(response.status()).toBe(403);
        });

        test('rejects a PUT request with a malformed token', async ({
            request,
        }) => {
            const response = await request.put(`/booking/${bookingId}`, {
                headers: { Cookie: 'token=not-a-real-token' },
                data: DEFAULT_BOOKING_DATA,
            });

            expect(response.status()).toBe(403);
        });

        test(
            'updating a non-existent booking id returns 404, not 405',
            { tag: '@issues' },
            async ({ request, authToken }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-007)');

                const response = await request.put('/booking/999999999', {
                    headers: { Cookie: `token=${authToken}` },
                    data: DEFAULT_BOOKING_DATA,
                });

                expect(response.status()).toBe(404);
            }
        );
    }
);
