import { JSONSchemaType } from 'ajv';

import { BookingListItem } from '@app-types/app';

// Shape returned by GET /booking — an array of { bookingid } summaries only.
export const BookingListSchema: JSONSchemaType<BookingListItem[]> = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            bookingid: { type: 'integer' },
        },
        required: ['bookingid'],
        additionalProperties: false,
    },
};
