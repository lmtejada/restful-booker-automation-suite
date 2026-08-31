import { JSONSchemaType } from 'ajv';

import { CreatedBookingResponse } from '@app-types/app';
import { BookingSchema } from '@test-data/schemas/app';

// Shape returned by POST /booking — the new bookingid plus an echo of the booking.
export const CreatedBookingSchema: JSONSchemaType<CreatedBookingResponse> = {
    type: 'object',
    properties: {
        bookingid: { type: 'integer' },
        booking: BookingSchema,
    },
    required: ['bookingid', 'booking'],
    additionalProperties: false,
};
