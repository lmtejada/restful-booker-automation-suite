import { test, expect } from '@playwright/test';

import { DEFAULT_BOOKING_DATA } from '@test-data/factories/booking-data.factory';

test.describe.serial(
    'booking Transactional CRUD Lifecycle',
    { tag: '@api' },
    () => {
        let bookingId: number;
        let token: string;

        test('1. Authenticate and obtain access token', async ({ request }) => {
            const response = await request.post('/auth', {
                data: {
                    username: 'admin',
                    password: 'password123',
                },
            });

            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body).toHaveProperty('token');

            token = body.token;
        });

        test('2. Create new booking record', async ({ request }) => {
            const response = await request.post('/booking', {
                data: DEFAULT_BOOKING_DATA,
            });

            expect(response.status()).toBe(200);
            const body = await response.json();

            // Structural assertion
            expect(body).toHaveProperty('bookingid');
            expect(body.booking.firstname).toBe(DEFAULT_BOOKING_DATA.firstname);
            expect(body.booking.totalprice).toBe(
                DEFAULT_BOOKING_DATA.totalprice
            );

            bookingId = body.bookingid;
        });

        test('3. Query reservation by ID', async ({ request }) => {
            const response = await request.get(`/booking/${bookingId}`);

            expect(response.status()).toBe(200);
            const body = await response.json();

            expect(body.firstname).toBe(DEFAULT_BOOKING_DATA.firstname);
            expect(body.lastname).toBe(DEFAULT_BOOKING_DATA.lastname);
            expect(body.additionalneeds).toBe(
                DEFAULT_BOOKING_DATA.additionalneeds
            );
        });

        test('4. Update reservation via PUT and PATCH', async ({ request }) => {
            // Full modification via PUT
            const updatedPayload = {
                ...DEFAULT_BOOKING_DATA,
                totalprice: 300,
                additionalneeds: 'Breakfast included',
            };

            const putResponse = await request.put(`/booking/${bookingId}`, {
                headers: {
                    Cookie: `token=${token}`,
                },
                data: updatedPayload,
            });

            expect(putResponse.status()).toBe(200);
            const putBody = await putResponse.json();
            expect(putBody.totalprice).toBe(300);
            expect(putBody.additionalneeds).toBe('Breakfast included');

            // Partial modification via PATCH
            const patchResponse = await request.patch(`/booking/${bookingId}`, {
                headers: {
                    Cookie: `token=${token}`,
                },
                data: {
                    additionalneeds: 'Airport Shuttle',
                },
            });

            expect(patchResponse.status()).toBe(200);
            const patchBody = await patchResponse.json();
            expect(patchBody.additionalneeds).toBe('Airport Shuttle');
        });

        test('5. Delete record and confirm 404', async ({ request }) => {
            // Delete resource
            const deleteResponse = await request.delete(
                `/booking/${bookingId}`,
                {
                    headers: {
                        Cookie: `token=${token}`,
                    },
                }
            );

            expect(deleteResponse.status()).toBe(201); // Restful-Booker returns 201 for DELETE

            // Confirm resource no longer exists
            const verifyResponse = await request.get(`/booking/${bookingId}`);
            expect(verifyResponse.status()).toBe(404);
        });
    }
);
