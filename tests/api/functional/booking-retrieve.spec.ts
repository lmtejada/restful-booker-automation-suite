import { expect, test } from '@fixtures/index.fixture';

import { Booking } from '@app-types/app';
import { DEFAULT_BOOKING_DATA } from '@test-data/factories/booking-data.factory';

test.describe(
    'retrieve bookings — GET /booking & GET /booking/:id',
    { tag: ['@api', '@regression'] },
    () => {
        let bookingId: number;

        test.beforeAll(async ({ bookingClient }) => {
            const response = await bookingClient.create(DEFAULT_BOOKING_DATA);
            const body = await response.json();
            bookingId = body.bookingid;
        });

        test(
            '[TC-010]: lists all booking ids',
            { tag: '@smoke' },
            async ({ bookingClient }) => {
                const response = await bookingClient.getAll();

                expect(response.status()).toBe(200);
                const body = await response.json();
                expect(Array.isArray(body)).toBe(true);
                expect(body[0]).toHaveProperty('bookingid');
            }
        );

        test('[TC-011]: filters by firstname', async ({ bookingClient }) => {
            const response = await bookingClient.getAll({
                params: { firstname: DEFAULT_BOOKING_DATA.firstname },
            });

            expect(response.status()).toBe(200);
            const body: { bookingid: number }[] = await response.json();
            expect(body.map((b) => b.bookingid)).toContain(bookingId);
        });

        test('[TC-011]: filters by lastname', async ({ bookingClient }) => {
            const response = await bookingClient.getAll({
                params: { lastname: DEFAULT_BOOKING_DATA.lastname },
            });

            expect(response.status()).toBe(200);
            const body: { bookingid: number }[] = await response.json();
            expect(body.map((b) => b.bookingid)).toContain(bookingId);
        });

        test('[TC-011]: filters by firstname and lastname combined', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.getAll({
                params: {
                    firstname: DEFAULT_BOOKING_DATA.firstname,
                    lastname: DEFAULT_BOOKING_DATA.lastname,
                },
            });

            expect(response.status()).toBe(200);
            const body: { bookingid: number }[] = await response.json();
            expect(body.map((b) => b.bookingid)).toContain(bookingId);
        });

        test(
            '[TC-012]: filters by checkin and checkout dates',
            { tag: '@issues' },
            async ({ bookingClient }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-009)');

                const response = await bookingClient.getAll({
                    params: {
                        checkin: DEFAULT_BOOKING_DATA.bookingdates.checkin,
                        checkout: DEFAULT_BOOKING_DATA.bookingdates.checkout,
                    },
                });

                expect(response.status()).toBe(200);
                const body: { bookingid: number }[] = await response.json();
                expect(body.map((b) => b.bookingid)).toContain(bookingId);
            }
        );

        test(
            '[TC-012]: filters by checkin alone',
            { tag: '@issues' },
            async ({ bookingClient }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-009)');

                const response = await bookingClient.getAll({
                    params: {
                        checkin: DEFAULT_BOOKING_DATA.bookingdates.checkin,
                    },
                });

                expect(response.status()).toBe(200);
                const body: { bookingid: number }[] = await response.json();
                expect(body.map((b) => b.bookingid)).toContain(bookingId);
            }
        );

        test('[TC-013]: returns no matches for an empty query parameter value', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.getAll({
                params: { firstname: '' },
            });

            expect(response.status()).toBe(200);
            const body: { bookingid: number }[] = await response.json();
            expect(body.map((b) => b.bookingid)).not.toContain(bookingId);
        });

        test('[TC-013]: ignores an unknown query parameter', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.getAll({
                params: { foo: 'bar' },
            });

            expect(response.status()).toBe(200);
            const body: { bookingid: number }[] = await response.json();
            expect(body.map((b) => b.bookingid)).toContain(bookingId);
        });

        test('[TC-014]: matches names case-sensitively', async ({
            bookingClient,
        }) => {
            const upperResponse = await bookingClient.getAll({
                params: {
                    firstname: DEFAULT_BOOKING_DATA.firstname.toUpperCase(),
                },
            });
            const lowerResponse = await bookingClient.getAll({
                params: {
                    firstname: DEFAULT_BOOKING_DATA.firstname.toLowerCase(),
                },
            });

            expect(upperResponse.status()).toBe(200);
            expect(lowerResponse.status()).toBe(200);

            const upperBody: { bookingid: number }[] =
                await upperResponse.json();
            const lowerBody: { bookingid: number }[] =
                await lowerResponse.json();

            expect(upperBody.map((b) => b.bookingid)).not.toContain(bookingId);
            expect(lowerBody.map((b) => b.bookingid)).not.toContain(bookingId);
        });

        test('[TC-015]: gets a single booking by id', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.getById(bookingId);

            expect(response.status()).toBe(200);
            const body: Booking = await response.json();

            expect(body.firstname).toBe(DEFAULT_BOOKING_DATA.firstname);
            expect(body.lastname).toBe(DEFAULT_BOOKING_DATA.lastname);
        });

        test(
            '[TC-016]: returns Content-Type: application/xml for an XML response',
            { tag: '@issues' },
            async ({ bookingClient }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-008)');

                const response = await bookingClient.getById(bookingId, {
                    headers: { Accept: 'application/xml' },
                });

                expect(response.headers()['content-type']).toContain(
                    'application/xml'
                );
            }
        );

        test('[TC-016]: honors Accept: application/xml for a single booking', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.getById(bookingId, {
                headers: { Accept: 'application/xml' },
            });

            expect(response.status()).toBe(200);

            const body = await response.text();
            expect(body).toContain(
                `<firstname>${DEFAULT_BOOKING_DATA.firstname}</firstname>`
            );
        });

        test('[TC-017]: returns 404 for a booking id that does not exist', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.getById(999999);

            expect(response.status()).toBe(404);
        });

        test('[TC-017]: returns 404 for a non-numeric booking id', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.getById('abc');

            expect(response.status()).toBe(404);
        });

        test(
            '[TC-018]: rejects a malformed date filter instead of silently matching',
            { tag: '@issues' },
            async ({ bookingClient }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-011)');

                const response = await bookingClient.getAll({
                    params: { checkin: '08-25-2026' },
                });

                expect(response.status()).toBe(400);
            }
        );
    }
);
