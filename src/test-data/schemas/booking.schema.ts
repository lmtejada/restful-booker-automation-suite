import { JSONSchemaType } from 'ajv';

import { Booking } from '@app-types/app';

// Shape returned by GET /booking/:id — the raw booking, no bookingid wrapper.
// PUT and PATCH responses also return this shape.
export const BookingSchema: JSONSchemaType<Booking> = {
    type: 'object',
    properties: {
        firstname: { type: 'string' },
        lastname: { type: 'string' },
        totalprice: { type: 'integer' },
        depositpaid: { type: 'boolean' },
        bookingdates: {
            type: 'object',
            properties: {
                checkin: { type: 'string', format: 'date' },
                checkout: { type: 'string', format: 'date' },
            },
            required: ['checkin', 'checkout'],
            additionalProperties: false,
        },
        additionalneeds: { type: 'string', nullable: true },
    },
    required: [
        'firstname',
        'lastname',
        'totalprice',
        'depositpaid',
        'bookingdates',
    ],
    additionalProperties: false,
};
