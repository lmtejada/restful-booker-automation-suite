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
