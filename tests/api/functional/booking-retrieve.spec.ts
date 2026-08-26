import { expect, test } from '@playwright/test';

import { Booking } from '@app-types/app';
import { DEFAULT_BOOKING_DATA } from '@test-data/factories/booking-data.factory';

test.describe(
    'retrieve bookings — GET /booking & GET /booking/:id',
    { tag: ['@api', '@regression'] },
    () => {
        let fixtureBookingId: number;

        test.beforeAll(async ({ request }) => {
            const response = await request.post('/booking', {
                data: DEFAULT_BOOKING_DATA,
            });
            const body = await response.json();
            fixtureBookingId = body.bookingid;
        });

        test(
            '[Smoke] lists all booking ids',
            { tag: '@smoke' },
            async ({ request }) => {
                const response = await request.get('/booking');

                expect(response.status()).toBe(200);
                const body = await response.json();
                expect(Array.isArray(body)).toBe(true);
                expect(body[0]).toHaveProperty('bookingid');
            }
        );

        test('filters by firstname', async ({ request }) => {
            const response = await request.get('/booking', {
                params: { firstname: DEFAULT_BOOKING_DATA.firstname },
            });

            expect(response.status()).toBe(200);
            const body: { bookingid: number }[] = await response.json();
            expect(body.map((b) => b.bookingid)).toContain(fixtureBookingId);
        });

        test('filters by lastname', async ({ request }) => {
            const response = await request.get('/booking', {
                params: { lastname: DEFAULT_BOOKING_DATA.lastname },
            });

            expect(response.status()).toBe(200);
            const body: { bookingid: number }[] = await response.json();
            expect(body.map((b) => b.bookingid)).toContain(fixtureBookingId);
        });

        test('filters by firstname and lastname combined', async ({
            request,
        }) => {
            const response = await request.get('/booking', {
                params: {
                    firstname: DEFAULT_BOOKING_DATA.firstname,
                    lastname: DEFAULT_BOOKING_DATA.lastname,
                },
            });

            expect(response.status()).toBe(200);
            const body: { bookingid: number }[] = await response.json();
            expect(body.map((b) => b.bookingid)).toContain(fixtureBookingId);
        });

        test(
            'filters by checkin and checkout dates',
            { tag: '@issues' },
            async ({ request }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-009)');

                const response = await request.get('/booking', {
                    params: {
                        checkin: DEFAULT_BOOKING_DATA.bookingdates.checkin,
                        checkout: DEFAULT_BOOKING_DATA.bookingdates.checkout,
                    },
                });

                expect(response.status()).toBe(200);
                const body: { bookingid: number }[] = await response.json();
                expect(body.map((b) => b.bookingid)).toContain(
                    fixtureBookingId
                );
            }
        );

        test('gets a single booking by id', async ({ request }) => {
            const response = await request.get(`/booking/${fixtureBookingId}`);

            expect(response.status()).toBe(200);
            const body: Booking = await response.json();
            expect(body.firstname).toBe(DEFAULT_BOOKING_DATA.firstname);
            expect(body.lastname).toBe(DEFAULT_BOOKING_DATA.lastname);
        });

        test(
            'returns Content-Type: application/xml for an XML response',
            { tag: '@issues' },
            async ({ request }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-008)');

                const response = await request.get(
                    `/booking/${fixtureBookingId}`,
                    { headers: { Accept: 'application/xml' } }
                );

                expect(response.headers()['content-type']).toContain(
                    'application/xml'
                );
            }
        );

        test('honors Accept: application/xml for a single booking', async ({
            request,
        }) => {
            const response = await request.get(`/booking/${fixtureBookingId}`, {
                headers: { Accept: 'application/xml' },
            });

            expect(response.status()).toBe(200);

            const body = await response.text();
            expect(body).toContain(
                `<firstname>${DEFAULT_BOOKING_DATA.firstname}</firstname>`
            );
        });

        test('returns 404 for a booking id that does not exist', async ({
            request,
        }) => {
            const response = await request.get('/booking/999999');

            expect(response.status()).toBe(404);
        });

        test('returns 404 for a non-numeric booking id', async ({
            request,
        }) => {
            const response = await request.get('/booking/abc');

            expect(response.status()).toBe(404);
        });

        test(
            'rejects a malformed date filter instead of silently matching',
            { tag: '@issues' },
            async ({ request }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-011)');

                const response = await request.get('/booking', {
                    params: { checkin: '08-25-2026' },
                });

                expect(response.status()).toBe(400);
            }
        );
    }
);
