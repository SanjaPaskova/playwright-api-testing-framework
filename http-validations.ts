import { expect, type APIResponse } from '@playwright/test';
import { HttpStatus } from './errorcodes';

/** Response must be one of the allowed HTTP statuses. */
export async function expectStatus(
  res: APIResponse,
  allowed: readonly number[],
): Promise<void> {
  if (allowed.includes(res.status())) return;
  const text = await res.text().catch(() => '');
  expect(
    allowed.includes(res.status()),
    `expected one of [${allowed.join(', ')}], got ${res.status()}: ${text.slice(0, 200)}`,
  ).toBeTruthy();
}

/** Successful HTTP response (2xx). Does not read the body if status is OK (so you can still call `.json()`). */
export async function expectSuccess(res: APIResponse): Promise<void> {
  if (!res.ok()) {
    const text = await res.text().catch(() => '');
    expect(res.ok(), text.slice(0, 500)).toBeTruthy();
  }
}

/** 404 response. */
export async function expectNotFound(res: APIResponse): Promise<void> {
  await expectStatus(res, [HttpStatus.NotFound]);
}

/** Common “client error” band for invalid input. */
export async function expectClientError(res: APIResponse): Promise<void> {
  await expectStatus(res, [HttpStatus.BadRequest, HttpStatus.NotFound, HttpStatus.MethodNotAllowed]);
}
