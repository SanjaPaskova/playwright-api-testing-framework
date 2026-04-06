import { expect, type APIRequestContext } from '@playwright/test';
import type { Pet, Order, CreatePetRequest, PlaceOrderRequest, CreateUserRequest } from './models';
import { Make } from './make';

/**
 * API-driven setup and cleanup helpers.
 *
 * All `create*` methods auto-track created IDs. Call `cleanupAll()` in fixture
 * teardown. Use `track*` when creating via `request.*` directly in a test body.
 */
export class DataSetupHelper {
    private readonly createdPetIds: number[] = [];
    private readonly createdOrderIds: number[] = [];
    private readonly createdUsernames: string[] = [];

    constructor(private readonly request: APIRequestContext) { }

    // ----- Pet helpers -----

    async createPet(overrides?: Partial<CreatePetRequest>): Promise<Pet> {
        const body = Make.petRequest(overrides);
        const res = await this.request.post('pet', { data: body });
        expect(res.status(), `POST /pet failed: ${await res.text()}`).toBe(200);
        const pet = (await res.json()) as Pet;
        this.createdPetIds.push(pet.id);
        return pet;
    }

    trackPet(id: number): void {
        this.createdPetIds.push(id);
    }

    async deletePet(id: number): Promise<void> {
        await this.request.delete(`pet/${id}`, { headers: { api_key: 'special-key' } });
    }

    async cleanupCreatedPets(): Promise<void> {
        for (const id of this.createdPetIds) {
            await this.deletePet(id).catch(() => { });
        }
        this.createdPetIds.length = 0;
    }

    // ----- Store / Order helpers -----

    async createOrder(petId: number, overrides?: Partial<PlaceOrderRequest>): Promise<Order> {
        const body = Make.orderRequest(petId, overrides);
        const res = await this.request.post('store/order', { data: body });
        expect(res.ok(), `POST /store/order failed: ${await res.text()}`).toBeTruthy();
        const order = (await res.json()) as Order;
        this.createdOrderIds.push(order.id);
        return order;
    }

    trackOrder(id: number): void {
        this.createdOrderIds.push(id);
    }

    async cleanupCreatedOrders(): Promise<void> {
        for (const id of this.createdOrderIds) {
            await this.request.delete(`store/order/${id}`).catch(() => { });
        }
        this.createdOrderIds.length = 0;
    }

    // ----- User helpers -----

    async createUser(overrides?: Partial<CreateUserRequest>): Promise<CreateUserRequest> {
        const body = Make.userRequest(overrides);
        const res = await this.request.post('user', { data: body });
        expect([200, 201], `POST /user failed: ${await res.text()}`).toContain(res.status());
        this.createdUsernames.push(body.username);
        return body;
    }

    trackUser(username: string): void {
        this.createdUsernames.push(username);
    }

    async cleanupCreatedUsers(): Promise<void> {
        for (const username of this.createdUsernames) {
            await this.request.delete(`user/${username}`).catch(() => { });
        }
        this.createdUsernames.length = 0;
    }

    // ----- Auth -----

    /**
     * Calls GET /user/login and returns the raw session token string.
     * Use the returned token in the `Authorization` header for subsequent authenticated requests.
     */
    async login(username: string, password: string): Promise<string> {
        const res = await this.request.get('user/login', { params: { username, password } });
        expect(res.ok(), `GET /user/login failed: ${await res.text()}`).toBeTruthy();
        const body = await res.json() as { message?: string };
        const token = body.message ?? '';
        expect(token.length, 'Expected a non-empty session token').toBeGreaterThan(0);
        return token;
    }

    // ----- Aggregate cleanup (call in fixture teardown) -----

    async cleanupAll(): Promise<void> {
        await this.cleanupCreatedPets();
        await this.cleanupCreatedOrders();
        await this.cleanupCreatedUsers();
    }
}
