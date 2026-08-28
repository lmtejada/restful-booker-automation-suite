import { expect, test } from '@fixtures/index.fixture';

import { DEFAULT_BOOKING_DATA } from '@test-data/factories/booking-data.factory';

test.describe(
    'delete booking — DELETE /booking/:id',
    { tag: ['@api', '@regression'] },
    () => {
        let bookingId: number;

        test.beforeEach(async ({ bookingClient }) => {
            const response = await bookingClient.create(DEFAULT_BOOKING_DATA);
            const body = await response.json();
            bookingId = body.bookingid;
        });

        test(
            '[Smoke] deletes a booking with a valid token, then 404s on lookup',
            { tag: '@smoke' },
            async ({ bookingClient, authToken }) => {
                const deleteResponse = await bookingClient.delete(
                    bookingId,
                    authToken
                );
                expect(deleteResponse.status()).toBe(201);

                const verifyResponse = await bookingClient.getById(bookingId);
                expect(verifyResponse.status()).toBe(404);
            }
        );

        test('rejects a delete request with no authorization', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.delete(bookingId);

            expect(response.status()).toBe(403);
        });

        test('rejects a delete request with a malformed token', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.delete(
                bookingId,
                'not-a-real-token'
            );

            expect(response.status()).toBe(403);
        });

        test(
            'deleting an already-deleted booking returns 404, not 405',
            { tag: '@issues' },
            async ({ bookingClient, authToken }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-007)');

                const firstDelete = await bookingClient.delete(
                    bookingId,
                    authToken
                );
                expect(firstDelete.status()).toBe(201);

                const secondDelete = await bookingClient.delete(
                    bookingId,
                    authToken
                );
                expect(secondDelete.status()).toBe(404);
            }
        );
    }
);
