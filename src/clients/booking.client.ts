import { APIRequestContext, APIResponse } from '@playwright/test';

import { Booking, RequestOptions } from '@app-types/app';
import { addAuthHeader } from '@utils/auth';
import { BOOKING_PATH } from '@utils/constants';

export class BookingClient {
    constructor(private readonly request: APIRequestContext) {}

    create(data: Booking): Promise<APIResponse> {
        return this.createWithOptions({ data });
    }

    // Escape method for negative tests that need full control over the
    // request (malformed JSON, XML bodies, custom Content-Type, no body).
    createWithOptions(options?: RequestOptions): Promise<APIResponse> {
        return this.request.post(BOOKING_PATH, options);
    }

    getAll(options?: RequestOptions): Promise<APIResponse> {
        return this.request.get(BOOKING_PATH, options);
    }

    getById(
        id: number | string,
        options?: RequestOptions
    ): Promise<APIResponse> {
        return this.request.get(`${BOOKING_PATH}/${id}`, options);
    }

    update(
        id: number,
        data: Booking,
        authToken?: string
    ): Promise<APIResponse> {
        return this.updateWithOptions(id, {
            data,
            headers: addAuthHeader(authToken),
        });
    }

    // Escape method for negative tests that need full control over the
    // request (Basic Auth, combined/fake headers, non-Booking-shaped bodies).
    updateWithOptions(
        id: number,
        options?: RequestOptions
    ): Promise<APIResponse> {
        return this.request.put(`${BOOKING_PATH}/${id}`, options);
    }

    partialUpdate(
        id: number,
        data: Partial<Booking>,
        authToken?: string
    ): Promise<APIResponse> {
        return this.partialUpdateWithOptions(id, {
            data,
            headers: addAuthHeader(authToken),
        });
    }

    // Escape method for negative tests that need full control over the
    // request (e.g. extra fields the Partial<Booking> type would reject).
    partialUpdateWithOptions(
        id: number,
        options?: RequestOptions
    ): Promise<APIResponse> {
        return this.request.patch(`${BOOKING_PATH}/${id}`, options);
    }

    delete(id: number, authToken?: string): Promise<APIResponse> {
        return this.request.delete(`${BOOKING_PATH}/${id}`, {
            headers: addAuthHeader(authToken),
        });
    }
}
