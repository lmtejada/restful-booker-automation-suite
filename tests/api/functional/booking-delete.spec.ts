import { expect, test } from '@fixtures/auth.fixture';

import { DEFAULT_BOOKING_DATA } from '@test-data/factories/booking-data.factory';

test.describe(
    'delete booking — DELETE /booking/:id',
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
            '[Smoke] deletes a booking with a valid token, then 404s on lookup',
            { tag: '@smoke' },
            async ({ request, authToken }) => {
                const deleteResponse = await request.delete(
                    `/booking/${bookingId}`,
                    { headers: { Cookie: `token=${authToken}` } }
                );
                expect(deleteResponse.status()).toBe(201);

                const verifyResponse = await request.get(
                    `/booking/${bookingId}`
                );
                expect(verifyResponse.status()).toBe(404);
            }
        );

        test('rejects a delete request with no authorization', async ({
            request,
        }) => {
            const response = await request.delete(`/booking/${bookingId}`);

            expect(response.status()).toBe(403);
        });

        test('rejects a delete request with a malformed token', async ({
            request,
        }) => {
            const response = await request.delete(`/booking/${bookingId}`, {
                headers: { Cookie: 'token=not-a-real-token' },
            });

            expect(response.status()).toBe(403);
        });

        test(
            'deleting an already-deleted booking returns 404, not 405',
            { tag: '@issues' },
            async ({ request, authToken }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-007)');

                const firstDelete = await request.delete(
                    `/booking/${bookingId}`,
                    { headers: { Cookie: `token=${authToken}` } }
                );
                expect(firstDelete.status()).toBe(201);

                const secondDelete = await request.delete(
                    `/booking/${bookingId}`,
                    { headers: { Cookie: `token=${authToken}` } }
                );
                expect(secondDelete.status()).toBe(404);
            }
        );
    }
);
