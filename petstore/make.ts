import { stringLowercaseAndNumbers } from '../helpers/generate-random';
import type {
    CreatePetRequest,
    PlaceOrderRequest,
    CreateUserRequest,
    Pet,
    Order,
    PetStatus,
    OrderStatus,
} from './models';
import { StaticTestData } from './static-test-data';

/**
 * Test data builders.
 * All functions return plain objects suitable as request bodies or expected DTOs.
 */

function petRequest(overrides?: Partial<CreatePetRequest>): CreatePetRequest {
    return {
        id: Math.floor(Math.random() * 8_000_000_000) + 1_000_000_000,
        name: `e2e-pet-${stringLowercaseAndNumbers(8)}`,
        photoUrls: [StaticTestData.defaultPhotoUrl],
        status: 'available',
        ...overrides,
    };
}

/**
 * Builds the expected Pet DTO from a CreatePetRequest (excludes id for comparison).
 * Mirrors Make.ProductDtoFromProductRequest.
 */
function expectedPetDto(request: CreatePetRequest): Omit<Pet, 'id'> {
    return {
        name: request.name,
        photoUrls: request.photoUrls,
        ...(request.category !== undefined && { category: request.category }),
        ...(request.tags !== undefined && { tags: request.tags }),
        ...(request.status !== undefined && { status: request.status }),
    };
}

function orderRequest(petId: number, overrides?: Partial<PlaceOrderRequest>): PlaceOrderRequest {
    return {
        petId,
        quantity: 1,
        status: 'placed',
        complete: false,
        ...overrides,
    };
}

/**
 * Builds the expected Order DTO from a PlaceOrderRequest (excludes id / shipDate).
 */
function expectedOrderDto(
    request: PlaceOrderRequest,
): Omit<Order, 'id' | 'shipDate'> {
    return {
        petId: request.petId,
        quantity: request.quantity ?? 1,
        status: request.status ?? 'placed',
        complete: request.complete ?? false,
    };
}

function userRequest(overrides?: Partial<CreateUserRequest>): CreateUserRequest {
    const username = `e2e_${stringLowercaseAndNumbers(10)}`;
    return {
        username,
        firstName: 'E2E',
        lastName: 'Test',
        email: `${username}@example.com`,
        password: 'secret',
        phone: '555',
        userStatus: 0,
        ...overrides,
    };
}

export const Make = {
    petRequest,
    expectedPetDto,
    orderRequest,
    expectedOrderDto,
    userRequest,
};
