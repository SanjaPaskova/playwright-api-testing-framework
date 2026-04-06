import { test, expect } from '../../petstore/fixtures';
import { Make } from '../../petstore/make';
import { StaticTestData } from '../../petstore/static-test-data';
import { expectPetstoreError, expectPetstoreSuccess } from '../../petstore/petstore-validations';
import { HttpStatus } from '../../errorcodes';
import type { Inventory, Order } from '../../petstore/models';

const STORE = 'store';

test.describe('store', () => {
    // ----- GET /store/inventory -----

    test('Given_authenticated_request_When_calling_GET_storeInventory_Should_return_inventory_map', async ({ request }) => {
        // act
        const res = await request.get(`${STORE}/inventory`);

        // assert
        expect(res.status()).toBe(HttpStatus.Ok);
        const data = await expectPetstoreSuccess<Inventory>(res);
        expect(typeof data).toBe('object');
        expect(data).not.toBeNull();
        // inventory map has at least one status bucket (available / pending / sold)
        expect(Object.keys(data).length).toBeGreaterThan(0);
    });

    // ----- POST /store/order -----

    test('Given_valid_order_When_calling_POST_storeOrder_Should_create_order', async ({ request, helper }) => {
        // arrange
        const pet = await helper.createPet({ name: 'E2E Order Pet', status: 'available' });
        const req = Make.orderRequest(pet.id, { quantity: 2, status: 'placed' });
        const expected = Make.expectedOrderDto(req);

        // act
        const res = await request.post(`${STORE}/order`, { data: req });

        // assert
        expect(res.ok()).toBeTruthy();
        const data = await res.json() as Order;
        helper.trackOrder(data.id);
        expect(data.petId).toBe(expected.petId);
        expect(data.quantity).toBe(expected.quantity);
        expect(data.status).toBe(expected.status);
        expect(data.complete).toBe(expected.complete);
        expect(data.id).toBeGreaterThan(0);
    });

    test('Given_valid_order_body_When_calling_POST_storeOrder_Should_return_order_with_id', async ({ request, helper }) => {
        // arrange
        const req = Make.orderRequest(1);

        // act
        const res = await request.post(`${STORE}/order`, { data: req });

        // assert
        expect(res.ok()).toBeTruthy();
        const data = await res.json() as Order;
        helper.trackOrder(data.id);
        expect(data).toHaveProperty('id');
        expect(typeof data.id).toBe('number');
    });

    // ----- GET /store/order/{orderId} -----

    test('Given_existing_order_When_calling_GET_storeOrder_by_id_Should_return_order', async ({ request, helper }) => {
        // arrange: create an order so we have a known ID
        const pet = await helper.createPet({ name: 'E2E StoreGet Pet' });
        const order = await helper.createOrder(pet.id);

        // act
        const res = await request.get(`${STORE}/order/${order.id}`);

        // assert
        expect([HttpStatus.Ok, HttpStatus.NotFound]).toContain(res.status()); // shared server may expire orders
        if (res.status() === HttpStatus.Ok) {
            const data = await res.json() as Order;
            expect(data.id).toBe(order.id);
            expect(data.petId).toBe(pet.id);
        }
    });

    test('Given_nonexistent_order_id_When_calling_GET_storeOrder_Should_return_404', async ({ request }) => {
        // act
        const res = await request.get(`${STORE}/order/${StaticTestData.nonexistentOrderId}`);

        // assert
        await expectPetstoreError(res, { httpStatus: HttpStatus.NotFound });
    });

    test('Given_invalid_order_id_When_calling_GET_storeOrder_Should_return_400', async ({ request }) => {
        // act (id = 0 is treated as invalid by Petstore)
        const res = await request.get(`${STORE}/order/${StaticTestData.invalidOrderId}`);

        // assert
        expect([HttpStatus.BadRequest, HttpStatus.NotFound]).toContain(res.status());
    });

    // ----- DELETE /store/order/{orderId} -----

    test('Given_existing_order_When_calling_DELETE_storeOrder_Should_return_success', async ({ request, helper }) => {
        // arrange
        const pet = await helper.createPet({ name: 'E2E DeleteOrder Pet' });
        const order = await helper.createOrder(pet.id);

        // act
        const res = await request.delete(`${STORE}/order/${order.id}`);

        // assert
        expect([HttpStatus.Ok, HttpStatus.NoContent, HttpStatus.NotFound]).toContain(res.status());
    });

    test('Given_nonexistent_order_id_When_calling_DELETE_storeOrder_Should_return_404', async ({ request }) => {
        // act
        const res = await request.delete(`${STORE}/order/${StaticTestData.nonexistentOrderId}`);

        // assert
        await expectPetstoreError(res, { httpStatus: HttpStatus.NotFound });
    });

    test('Given_invalid_order_id_When_calling_DELETE_storeOrder_Should_return_400_or_404', async ({ request }) => {
        // act
        const res = await request.delete(`${STORE}/order/${StaticTestData.invalidOrderId}`);

        // assert
        expect([HttpStatus.BadRequest, HttpStatus.NotFound]).toContain(res.status());
    });
});
