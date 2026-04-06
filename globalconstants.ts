/**
 * Shared constants 
 */

// —— Playwright / demo API ——

/** `process.env` key for Petstore (or other) API base URL override. */
export const PetstoreBaseUrlEnvVar = 'PETSTORE_BASE_URL';

export const DefaultPetstoreBaseUrl = 'https://petstore.swagger.io/v2';

export const HttpAcceptJson = 'application/json';

/** `process.env` key for the Petstore API key (`api_key` header). Optional — omit for unauthenticated requests. */
export const ApiKeyEnvVar = 'PETSTORE_API_KEY';

/** `process.env` keys for Petstore login credentials. */
export const UsernameEnvVar = 'PETSTORE_USERNAME';
export const PasswordEnvVar = 'PETSTORE_PASSWORD';

export const DefaultPetstoreUsername = 'user1';
export const DefaultPetstorePassword = 'test1';

export function resolveApiKey(): string | undefined {
  return process.env[ApiKeyEnvVar];
}

export function resolveCredentials(): { username: string; password: string } {
  return {
    username: process.env[UsernameEnvVar] ?? DefaultPetstoreUsername,
    password: process.env[PasswordEnvVar] ?? DefaultPetstorePassword,
  };
}

export function normalizeBaseUrlWithTrailingSlash(base: string): string {
  return base.endsWith('/') ? base : `${base}/`;
}

export function resolvePlaywrightBaseUrl(): string {
  const base =
    process.env[PetstoreBaseUrlEnvVar] ?? DefaultPetstoreBaseUrl;
  return normalizeBaseUrlWithTrailingSlash(base);
}

