import { APIRequestContext } from '@playwright/test';

export const DEFAULT_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
};

export async function getAuthToken(
    request: APIRequestContext
): Promise<string> {
    const response = await request.post('/auth', { data: DEFAULT_CREDENTIALS });
    const body = await response.json();

    if (response.status() !== 200 || !body.token) {
        throw new Error(
            `Failed to obtain auth token: ${response.status()} ${JSON.stringify(body)}`
        );
    }

    return body.token;
}

export function addAuthHeader(
    token?: string
): Record<string, string> | undefined {
    return token ? { Cookie: `token=${token}` } : undefined;
}
