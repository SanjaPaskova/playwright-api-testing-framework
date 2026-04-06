import { expect, type APIResponse } from '@playwright/test';
import type { PetstoreApiResponse, PetstoreErrorExpectation } from '../error-response';

export type { PetstoreErrorExpectation } from '../error-response';

/**
 * Assert HTTP status and optional Petstore ApiResponse fields.
 * Returns the parsed body so callers can do further assertions.
 */
export async function expectPetstoreError(
    res: APIResponse,
    expected: PetstoreErrorExpectation,
): Promise<PetstoreApiResponse> {
    expect(res.status()).toBe(expected.httpStatus);
    const text = await res.text();
    let body: PetstoreApiResponse = {};
    if (text.trim()) {
        try {
            body = JSON.parse(text) as PetstoreApiResponse;
        } catch {
            // some Petstore error responses are plain text
        }
    }
    if (expected.type !== undefined) {
        expect(body.type).toBe(expected.type);
    }
    if (expected.messageContains !== undefined) {
        expect(body.message ?? '').toContain(expected.messageContains);
    }
    return body;
}

/**
 * Assert a successful Petstore response (2xx) and return parsed body.
 */
export async function expectPetstoreSuccess<T>(res: APIResponse): Promise<T> {
    if (!res.ok()) {
        const text = await res.text().catch(() => '');
        expect(res.ok(), `Expected 2xx, got ${res.status()}: ${text.slice(0, 300)}`).toBeTruthy();
    }
    return (await res.json()) as T;
}

/**
 * Assert the Petstore returns a specific HTTP status; flexible overload for
 * cases where multiple codes are acceptable (mirrors C# `Should().BeOneOf`).
 */
export async function expectPetstoreStatus(
    res: APIResponse,
    allowed: number | readonly number[],
): Promise<void> {
    const codes = Array.isArray(allowed) ? (allowed as number[]) : [allowed as number];
    if (!codes.includes(res.status())) {
        const text = await res.text().catch(() => '');
        expect(
            false,
            `Expected one of [${codes.join(', ')}], got ${res.status()}: ${text.slice(0, 200)}`,
        ).toBeTruthy();
    }
}
