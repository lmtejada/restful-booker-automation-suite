import { expect, test } from '@fixtures/index.fixture';

import {
    DEFAULT_BOOKING_DATA,
    generateBookingData,
    MALICIOUS_PAYLOADS,
} from '@test-data/factories/booking-data.factory';

test.describe(
    'create booking — POST /booking',
    { tag: ['@api', '@regression'] },
    () => {
        test(
            '[TC-005]: creates a booking from a valid JSON payload',
            { tag: '@smoke' },
            async ({ bookingClient }) => {
                const response =
                    await bookingClient.create(DEFAULT_BOOKING_DATA);

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
            '[TC-007]: returns Content-Type: application/xml for an XML response',
            { tag: '@issues' },
            async ({ bookingClient }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-008)');

                const response = await bookingClient.createWithOptions({
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

        test('[TC-006]: creates a booking from an XML payload', async ({
            bookingClient,
        }) => {
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

            const response = await bookingClient.createWithOptions({
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
            '[TC-008]: accepts an illogical date range where checkin is after checkout',
            { tag: '@issues' },
            async ({ bookingClient }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-005)');

                const response = await bookingClient.create(
                    generateBookingData({
                        bookingdates: {
                            checkin: '2026-05-10',
                            checkout: '2026-05-01',
                        },
                    })
                );

                expect(response.status()).toBe(400);
            }
        );

        test(
            '[TC-009]: returns a 500 for an unsupported Content-Type instead of a 4xx',
            { tag: '@issues' },
            async ({ bookingClient }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-006)');

                const response = await bookingClient.createWithOptions({
                    headers: { 'Content-Type': 'application/yaml' },
                    data: 'firstname: Jim',
                });

                expect(response.status()).toBe(415);
            }
        );

        test(
            '[TC-009]: returns a 500 for a text/plain Content-Type instead of a 4xx',
            { tag: '@issues' },
            async ({ bookingClient }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-006)');

                const response = await bookingClient.createWithOptions({
                    headers: { 'Content-Type': 'text/plain' },
                    data: JSON.stringify(DEFAULT_BOOKING_DATA),
                });

                expect(response.status()).toBe(415);
            }
        );

        test('[TC-008]: rejects syntactically malformed JSON with a 400', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.createWithOptions({
                data: '{"firstname": "Jim", "lastname": "Brown"',
            });

            expect(response.status()).toBe(400);
        });

        test(
            '[TC-008]: returns a 500 for a completely empty body instead of a 400',
            { tag: '@issues' },
            async ({ bookingClient }) => {
                test.fail(true, 'Known bug — see docs/DEFECT-LOG.md (BUG-001)');

                const response = await bookingClient.createWithOptions();

                expect(response.status()).toBe(400);
            }
        );

        test('[TC-008]: ignores unexpected extra fields in the payload', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.createWithOptions({
                data: generateBookingData({ isAdmin: true }),
            });

            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.booking).not.toHaveProperty('isAdmin');
        });

        test('[TC-031]: stores injection-style inputs instead of erroring', async ({
            bookingClient,
        }) => {
            for (const scenario of MALICIOUS_PAYLOADS) {
                const payload = generateBookingData(scenario);
                const response = await bookingClient.createWithOptions({
                    data: payload,
                });

                expect(response.status()).toBe(200);
                const body = await response.json();

                expect(body.booking.firstname).toBe(payload.firstname);
                expect(body.booking.lastname).toBe(payload.lastname);
                expect(body.booking.additionalneeds).toBe(
                    payload.additionalneeds
                );
            }
        });
    }
);
