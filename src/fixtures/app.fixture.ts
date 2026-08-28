import { mergeTests } from '@playwright/test';

import { test as apiClientsTest } from '@fixtures/api-clients.fixture';
import { test as authTest } from '@fixtures/auth.fixture';

export const test = mergeTests(apiClientsTest, authTest);

export { expect } from '@playwright/test';
