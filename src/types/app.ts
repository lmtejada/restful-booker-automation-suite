import { APIRequestContext } from '@playwright/test';

/**
 * Same shape as T, but every field (including nested objects) also accepts
 * null/undefined — for building deliberately invalid payloads in negative tests.
 */
export type Nullable<T> = {
    [K in keyof T]?: T[K] extends object ? Nullable<T[K]> | null : T[K] | null;
};

export interface Booking {
    firstname: string;
    lastname: string;
    totalprice: number;
    depositpaid: boolean;
    bookingdates: {
        checkin: string;
        checkout: string;
    };
    additionalneeds?: string;
}

// A clean alias for the Playwright APIRequestContext post() options type, for use in our API clients and tests.
export type RequestOptions = Parameters<APIRequestContext['post']>[1];
