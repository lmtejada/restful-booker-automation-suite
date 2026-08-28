import { APIRequestContext, APIResponse } from '@playwright/test';

import { RequestOptions } from '@app-types/app';
import { AUTH_PATH } from '@utils/constants';

export class AuthClient {
    constructor(private readonly request: APIRequestContext) {}

    login(credentials: Record<string, unknown>): Promise<APIResponse> {
        return this.loginWithOptions({ data: credentials });
    }

    // Escape method for negative tests that need full control over the
    // request (missing fields, wrong Content-Type, unsupported methods).
    loginWithOptions(options?: RequestOptions): Promise<APIResponse> {
        return this.request.post(AUTH_PATH, options);
    }
}
