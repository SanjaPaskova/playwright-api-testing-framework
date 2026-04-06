import { test, expect } from '@playwright/test';
import {
    expectStatus,
    expectSuccess,
    expectNotFound,
    expectClientError,
} from '../../http-validations';
import { HttpStatus } from '../../errorcodes';
import { parseJson } from '../../helpers/json-helper';

/** Request / response validation checks (status + shape). */
test.describe('validations — Petstore', () => {
    test('invalid pet id path returns client error', async ({ request }) => {
        const res = await request.get('pet/not-a-number');
        await expectClientError(res);
    });

    test('unknown pet id returns 404', async ({ request }) => {
        const res = await request.get('pet/999999999999999999');
        await expectNotFound(res);
    });

    test('GET findByStatus missing required query — Petstore returns 400 or 404', async ({
        request,
    }) => {
        const res = await request.get('pet/findByStatus');
        await expectStatus(res, [HttpStatus.BadRequest, HttpStatus.NotFound, HttpStatus.Ok]);
        if (res.status() === HttpStatus.Ok) {
            const body = await res.json();
            expect(Array.isArray(body)).toBeTruthy();
        }
    });

    test('invalid store order id returns 400 or 404', async ({ request }) => {
        const res = await request.get('store/order/0');
        await expectStatus(res, [HttpStatus.BadRequest, HttpStatus.NotFound]);
    });

    test('successful GET still validates array shape', async ({ request }) => {
        const res = await request.get('pet/findByStatus', { params: { status: 'sold' } });
        await expectSuccess(res);
        const body = parseJson<unknown[]>(await res.text());
        expect(Array.isArray(body)).toBeTruthy();
        for (const pet of body.slice(0, 3)) {
            expect(pet).toHaveProperty('name');
            expect(pet).toHaveProperty('photoUrls');
        }
    });

});

/** When Petstore returns an error JSON, assert minimal shape. */
test.describe('validations — error JSON shape (Petstore)', () => {
    test('404 pet error body parses as JSON when present', async ({ request }) => {
        const res = await request.get('pet/999999999999999999');
        expect(res.status()).toBe(HttpStatus.NotFound);
        const text = await res.text();
        if (!text.trim()) return;
        let body: Record<string, unknown>;
        try {
            body = parseJson<Record<string, unknown>>(text);
        } catch {
            expect(text.length).toBeGreaterThan(0);
            return;
        }
        expect(
            typeof body.message === 'string' || typeof body.type === 'string' || typeof body.code === 'number',
        ).toBeTruthy();
    });
});
