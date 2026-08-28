import { test, expect } from '@fixtures/app.fixture';

import {
    DEFAULT_BOOKING_DATA,
    generateBookingData,
} from '@test-data/factories/booking-data.factory';
import { DEFAULT_CREDENTIALS } from '@utils/auth';

test.describe.serial(
    'booking Transactional CRUD Lifecycle',
    { tag: ['@api', '@integration'] },
    () => {
        let bookingId: number;
        let token: string;

        test('[TC-029]: 1. Authenticate and obtain access token', async ({
            authClient,
        }) => {
            const response = await authClient.login(DEFAULT_CREDENTIALS);

            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body).toHaveProperty('token');

            token = body.token;
        });

        test('[TC-029]: 2. Create new booking record', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.create(DEFAULT_BOOKING_DATA);

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

        test('[TC-029]: 3. Query reservation by ID', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.getById(bookingId);

            expect(response.status()).toBe(200);
            const body = await response.json();

            expect(body.firstname).toBe(DEFAULT_BOOKING_DATA.firstname);
            expect(body.lastname).toBe(DEFAULT_BOOKING_DATA.lastname);
            expect(body.additionalneeds).toBe(
                DEFAULT_BOOKING_DATA.additionalneeds
            );
        });

        test('[TC-029]: 4. Update reservation via PUT and PATCH', async ({
            bookingClient,
        }) => {
            // Full modification via PUT
            const updatedPayload = generateBookingData({
                totalprice: 300,
                additionalneeds: 'Breakfast included',
            });

            const putResponse = await bookingClient.update(
                bookingId,
                updatedPayload,
                token
            );

            expect(putResponse.status()).toBe(200);
            const putBody = await putResponse.json();
            expect(putBody.totalprice).toBe(300);
            expect(putBody.additionalneeds).toBe('Breakfast included');

            // Partial modification via PATCH
            const patchResponse = await bookingClient.partialUpdate(
                bookingId,
                { additionalneeds: 'Airport Shuttle' },
                token
            );

            expect(patchResponse.status()).toBe(200);
            const patchBody = await patchResponse.json();
            expect(patchBody.additionalneeds).toBe('Airport Shuttle');
        });

        test('[TC-029]: 5. Delete record and confirm 404', async ({
            bookingClient,
        }) => {
            const deleteResponse = await bookingClient.delete(bookingId, token);

            // Restful-Booker returns 201 for DELETE
            expect(deleteResponse.status()).toBe(201);

            // Confirm resource no longer exists
            const verifyResponse = await bookingClient.getById(bookingId);
            expect(verifyResponse.status()).toBe(404);
        });
    }
);
