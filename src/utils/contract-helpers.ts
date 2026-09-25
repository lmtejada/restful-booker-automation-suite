import { MatchersV3, V3MockServer } from '@pact-foundation/pact';
import { APIRequestContext, request as apiRequest } from '@playwright/test';

import { Booking } from '@app-types/app';
import {
    BookingBodyMatcher,
    BookingDatesMatcher,
} from '@app-types/contract-matchers';

const ISO_DATE_PATTERN = '^\\d{4}-\\d{2}-\\d{2}$';

export const JSON_RESPONSE_HEADERS = {
    'Content-Type': 'application/json; charset=utf-8',
};

export function bookingDatesMatcher(
    dates: Booking['bookingdates']
): BookingDatesMatcher {
    return {
        checkin: MatchersV3.regex(ISO_DATE_PATTERN, dates.checkin),
        checkout: MatchersV3.regex(ISO_DATE_PATTERN, dates.checkout),
    };
}

// The shape shared by every interaction that returns a booking. Callers add
// `bookingid`/`additionalneeds` on top where the endpoint they're describing
// actually includes them.
export function bookingBodyMatcher(data: Booking): BookingBodyMatcher {
    return {
        firstname: MatchersV3.like(data.firstname),
        lastname: MatchersV3.like(data.lastname),
        totalprice: MatchersV3.integer(data.totalprice),
        depositpaid: MatchersV3.boolean(data.depositpaid),
        bookingdates: bookingDatesMatcher(data.bookingdates),
    };
}

// Opens an APIRequestContext against Pact's mock server, hands it to `run`,
// and always disposes it afterwards — including when `run` throws, so a
// failed assertion doesn't leak the context.
export async function withMockClient<T>(
    mockServer: V3MockServer,
    run: (context: APIRequestContext) => Promise<T>
): Promise<T> {
    const mockContext = await apiRequest.newContext({
        baseURL: mockServer.url,
    });

    try {
        return await run(mockContext);
    } finally {
        await mockContext.dispose();
    }
}
