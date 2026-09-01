import { Matcher } from '@pact-foundation/pact';

export interface BookingDatesMatcher {
    checkin: Matcher<string>;
    checkout: Matcher<string>;
}

export interface BookingBodyMatcher {
    firstname: Matcher<string>;
    lastname: Matcher<string>;
    totalprice: Matcher<number>;
    depositpaid: Matcher<boolean>;
    bookingdates: BookingDatesMatcher;
}
