import { faker } from '@faker-js/faker';

import { Booking, Nullable } from '@app-types/app';

function toDateString(date: Date): string {
    return date.toISOString().split('T')[0];
}

export const DEFAULT_BOOKING_DATA: Booking = {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 100, max: 500 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: {
        checkin: toDateString(faker.date.future()),
        checkout: toDateString(faker.date.future()),
    },
    additionalneeds: faker.helpers.arrayElement([
        'Breakfast',
        'Late Checkout',
        'Extra Pillows',
        'Airport Shuttle',
    ]),
};

export function createBookingData(overrides: Nullable<Booking>): Booking {
    return { ...DEFAULT_BOOKING_DATA, ...overrides } as Booking;
}

/**
 * Restful Booker has no real server-side validation (see docs/related/DEFECT-LOG.md).
 * These scenarios assert what a well-behaved API *should* do. Scenarios with
 * `knownBug: true` are known to currently fail — the spec runs them via
 * `test.fail()` so they don't redden the suite, but the moment the underlying bug
 * is fixed the test starts unexpectedly passing, which is the signal to flip
 * `knownBug` back to false (or remove it) and update the defect log.
 */
interface ValidationScenario {
    description: string;
    overrides: Nullable<Booking>;
    expectedStatus: number;
    expectedBookingSubset?: Record<string, unknown>;
    knownBug?: boolean;
}

export const VALIDATION_SCENARIOS: ValidationScenario[] = [
    {
        description: 'Missing firstname',
        overrides: { firstname: undefined },
        expectedStatus: 400,
        knownBug: true,
    },
    {
        description: 'Null lastname value',
        overrides: { lastname: null },
        expectedStatus: 400,
        knownBug: true,
    },
    {
        description: 'Empty string for firstname and lastname',
        overrides: { firstname: '', lastname: '' },
        expectedStatus: 400,
        knownBug: true,
    },
    {
        description: 'Missing totalprice',
        overrides: { totalprice: undefined },
        expectedStatus: 400,
        knownBug: true,
    },
    {
        description: 'Missing depositpaid',
        overrides: { depositpaid: undefined },
        expectedStatus: 400,
        knownBug: true,
    },
    {
        description: 'Missing bookingdates',
        overrides: { bookingdates: undefined },
        expectedStatus: 400,
        knownBug: true,
    },
    {
        description: 'Missing checkin date',
        overrides: {
            bookingdates: { checkin: undefined, checkout: '2026-08-30' },
        },
        expectedStatus: 400,
        knownBug: true,
    },
    {
        description: 'Missing checkout date',
        overrides: {
            bookingdates: { checkin: '2026-08-25', checkout: undefined },
        },
        expectedStatus: 400,
        knownBug: true,
    },
    {
        description: 'Invalid date format for checkin',
        overrides: {
            bookingdates: { checkin: 'invalid-date', checkout: '2026-08-30' },
        },
        expectedStatus: 400,
        knownBug: true,
    },
    {
        description: 'Invalid date format for checkout',
        overrides: {
            bookingdates: { checkin: '2026-08-25', checkout: 'invalid-date' },
        },
        expectedStatus: 400,
        knownBug: true,
    },
    {
        description: 'Null additionalneeds value',
        overrides: { additionalneeds: null },
        expectedStatus: 200,
        expectedBookingSubset: { additionalneeds: null },
    },
    {
        description: 'Empty string for additionalneeds',
        overrides: { additionalneeds: '' },
        expectedStatus: 200,
        expectedBookingSubset: { additionalneeds: '' },
    },
    {
        description: 'Additional needs with special characters',
        overrides: { additionalneeds: '@#$%^&*()' },
        expectedStatus: 200,
        expectedBookingSubset: { additionalneeds: '@#$%^&*()' },
    },
];
