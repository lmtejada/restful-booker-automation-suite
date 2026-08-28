import { test as base } from '@playwright/test';

import { AuthClient } from '@clients/auth.client';
import { BookingClient } from '@clients/booking.client';

interface ApiClients {
    bookingClient: BookingClient;
    authClient: AuthClient;
}

export const test = base.extend<ApiClients>({
    bookingClient: async ({ request }, use) => {
        await use(new BookingClient(request));
    },
    authClient: async ({ request }, use) => {
        await use(new AuthClient(request));
    },
});

export { expect } from '@playwright/test';
