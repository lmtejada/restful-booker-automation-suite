import { test, expect } from '@fixtures/app.fixture';

import {
    DEFAULT_BOOKING_DATA,
    generateBookingData,
} from '@test-data/factories/booking-data.factory';
import {
    BookingSchema,
    CreatedBookingSchema,
    BookingListSchema,
} from '@test-data/schemas/app';
import { compileSchema, formatSchemaErrors } from '@utils/schema-validator';

test.describe(
    'response schema validation',
    { tag: ['@api', '@integration'] },
    () => {
        let bookingId: number;

        test.beforeAll(async ({ bookingClient }) => {
            const response = await bookingClient.create(DEFAULT_BOOKING_DATA);
            const body = await response.json();
            bookingId = body.bookingid;
        });

        test('[TC-032]: POST /booking response matches the created-booking schema', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.create(DEFAULT_BOOKING_DATA);
            const body = await response.json();

            const validate = compileSchema(CreatedBookingSchema);
            const isValid = validate(body);

            expect(isValid, formatSchemaErrors(validate)).toBe(true);
        });

        test('[TC-032]: GET /booking/:id response matches the booking schema', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.getById(bookingId);
            const body = await response.json();

            const validate = compileSchema(BookingSchema);
            const isValid = validate(body);

            expect(isValid, formatSchemaErrors(validate)).toBe(true);
        });

        test('[TC-032]: GET /booking response matches the booking-list schema', async ({
            bookingClient,
        }) => {
            const response = await bookingClient.getAll();
            const body = await response.json();

            const validate = compileSchema(BookingListSchema);
            const isValid = validate(body);

            expect(isValid, formatSchemaErrors(validate)).toBe(true);
        });

        test('[TC-032]: PUT /booking/:id response matches the booking schema', async ({
            bookingClient,
            authToken,
        }) => {
            const response = await bookingClient.update(
                bookingId,
                generateBookingData({ totalprice: 321 }),
                authToken
            );
            const body = await response.json();

            const validate = compileSchema(BookingSchema);
            const isValid = validate(body);

            expect(isValid, formatSchemaErrors(validate)).toBe(true);
        });

        test('[TC-032]: PATCH /booking/:id response matches the booking schema', async ({
            bookingClient,
            authToken,
        }) => {
            const response = await bookingClient.partialUpdate(
                bookingId,
                { totalprice: 432 },
                authToken
            );
            const body = await response.json();

            const validate = compileSchema(BookingSchema);
            const isValid = validate(body);

            expect(isValid, formatSchemaErrors(validate)).toBe(true);
        });
    }
);
