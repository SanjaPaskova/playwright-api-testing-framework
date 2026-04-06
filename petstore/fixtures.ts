import { test as base, expect } from '@playwright/test';
import { DataSetupHelper } from './data-setup-helper';
import { resolveCredentials } from '../globalconstants';

/**
 * Playwright fixture types for Petstore tests.
 * Mirrors C# IClassFixture<T> + IAsyncLifetime teardown pattern.
 */
export type PetstoreTestFixtures = {
    /** Per-test DataSetupHelper; all tracked items are cleaned up after each test. */
    helper: DataSetupHelper;
    /** Session token obtained via GET /user/login. Use in Authorization header for authenticated requests. */
    sessionToken: string;
};

/**
 * Extended `test` with the `helper` fixture injected.
 * Import this `test` (and `expect`) into all petstore spec files instead of
 * `@playwright/test` directly so the fixture is available.
 *
 * Usage:
 *   import { test, expect } from '../../petstore/fixtures';
 *   test('...', async ({ request, helper }) => { ... });
 */
export const test = base.extend<PetstoreTestFixtures>({
    helper: async ({ request }, use) => {
        const helper = new DataSetupHelper(request);
        await use(helper);
        // mirrors IAsyncLifetime.DisposeAsync – runs after every test
        await helper.cleanupAll();
    },
    sessionToken: async ({ request }, use) => {
        const { username, password } = resolveCredentials();
        const helper = new DataSetupHelper(request);
        const token = await helper.login(username, password);
        await use(token);
    },
});

export { expect };
