/**
 * JSON helpers (mirrors portal_e2e_api_tests.Shared.Helpers.JsonHelper intent for tests).
 */
export function parseJson<T>(text: string): T {
  return JSON.parse(text) as T;
}
