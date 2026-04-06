const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Mirrors portal_e2e_api_tests.Shared.Helpers.GenerateRandom.StringLowercaseAndNumbers.
 */
export function stringLowercaseAndNumbers(length: number): string {
  let s = '';
  for (let i = 0; i < length; i++) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return s;
}
