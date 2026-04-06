import { defineConfig } from '@playwright/test';
import { HttpAcceptJson, resolveApiKey, resolvePlaywrightBaseUrl } from './globalconstants';

const baseURL = resolvePlaywrightBaseUrl();
const apiKey = resolveApiKey();

const extraHTTPHeaders: Record<string, string> = {
  Accept: HttpAcceptJson,
  ...(apiKey ? { api_key: apiKey } : {}),
};

export default defineConfig({
  testDir: './tests',
  reporter: process.env.CI ? 'dot' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    extraHTTPHeaders,
  },
});
