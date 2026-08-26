import { expect, test } from '@playwright/test';

import { DEFAULT_BOOKING_DATA } from '@test-data/factories/booking-data.factory';

test.describe(
    'create booking — POST /booking',
    { tag: ['@api', '@regression'] },
    () => {
        test(
            '[Smoke] creates a booking from a valid JSON payload',
            { tag: '@smoke' },
            async ({ request }) => {
                const response = await request.post('/booking', {
                    data: DEFAULT_BOOKING_DATA,
                });

                expect(response.status()).toBe(200);
                const body = await response.json();

                expect(body).toHaveProperty('bookingid');
                expect(body.booking.firstname).toBe(
                    DEFAULT_BOOKING_DATA.firstname
                );
                expect(body.booking.lastname).toBe(
                    DEFAULT_BOOKING_DATA.lastname
                );
                expect(body.booking.totalprice).toBe(
                    DEFAULT_BOOKING_DATA.totalprice
                );
            }
        );

        test(
            'returns Content-Type: application/xml for an XML response',
            { tag: '@issues' },
            async ({ request }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-008)');

                const response = await request.post('/booking', {
                    headers: {
                        'Content-Type': 'text/xml',
                        Accept: 'application/xml',
                    },
                    data: `
                        <booking>
                            <firstname>${DEFAULT_BOOKING_DATA.firstname}</firstname>
                            <lastname>${DEFAULT_BOOKING_DATA.lastname}</lastname>
                            <totalprice>${DEFAULT_BOOKING_DATA.totalprice}</totalprice>
                            <depositpaid>${DEFAULT_BOOKING_DATA.depositpaid}</depositpaid>
                            <bookingdates>
                                <checkin>${DEFAULT_BOOKING_DATA.bookingdates.checkin}</checkin>
                                <checkout>${DEFAULT_BOOKING_DATA.bookingdates.checkout}</checkout>
                            </bookingdates>
                        </booking>`,
                });

                expect(response.headers()['content-type']).toContain(
                    'application/xml'
                );
            }
        );

        test('creates a booking from an XML payload', async ({ request }) => {
            const xmlPayload = `
                <booking>
                    <firstname>${DEFAULT_BOOKING_DATA.firstname}</firstname>
                    <lastname>${DEFAULT_BOOKING_DATA.lastname}</lastname>
                    <totalprice>${DEFAULT_BOOKING_DATA.totalprice}</totalprice>
                    <depositpaid>${DEFAULT_BOOKING_DATA.depositpaid}</depositpaid>
                    <bookingdates>
                        <checkin>${DEFAULT_BOOKING_DATA.bookingdates.checkin}</checkin>
                        <checkout>${DEFAULT_BOOKING_DATA.bookingdates.checkout}</checkout>
                    </bookingdates>
                </booking>`;

            const response = await request.post('/booking', {
                headers: {
                    'Content-Type': 'text/xml',
                    Accept: 'application/xml',
                },
                data: xmlPayload,
            });

            expect(response.status()).toBe(200);

            const body = await response.text();
            expect(body).toContain('<created-booking>');
            expect(body).toContain(
                `<firstname>${DEFAULT_BOOKING_DATA.firstname}</firstname>`
            );
        });

        test(
            'accepts an illogical date range where checkin is after checkout',
            { tag: '@issues' },
            async ({ request }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-005)');

                const response = await request.post('/booking', {
                    data: {
                        ...DEFAULT_BOOKING_DATA,
                        bookingdates: {
                            checkin: '2026-05-10',
                            checkout: '2026-05-01',
                        },
                    },
                });

                expect(response.status()).toBe(400);
            }
        );

        test(
            'returns a 500 for an unsupported Content-Type instead of a 4xx',
            { tag: '@issues' },
            async ({ request }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-006)');

                const response = await request.post('/booking', {
                    headers: { 'Content-Type': 'application/yaml' },
                    data: 'firstname: Jim',
                });

                expect(response.status()).toBe(415);
            }
        );
    }
);
