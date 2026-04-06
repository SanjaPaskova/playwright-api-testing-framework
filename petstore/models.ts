/**
 * Petstore Swagger v2 model types.
 */

export type PetStatus = 'available' | 'pending' | 'sold';
export type OrderStatus = 'placed' | 'approved' | 'delivered';

export interface Category {
    id?: number;
    name?: string;
}

export interface Tag {
    id?: number;
    name?: string;
}

// ----- Request interfaces -----

export interface CreatePetRequest {
    id?: number;
    name: string;
    photoUrls: string[];
    category?: Category;
    tags?: Tag[];
    status?: PetStatus;
}

export interface PlaceOrderRequest {
    petId: number;
    quantity?: number;
    shipDate?: string;
    status?: OrderStatus;
    complete?: boolean;
}

export interface CreateUserRequest {
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phone?: string;
    userStatus?: number;
}

// ----- Response / DTO interfaces -----

export interface Pet {
    id: number;
    name: string;
    photoUrls: string[];
    category?: Category;
    tags?: Tag[];
    status?: PetStatus;
}

export interface Order {
    id: number;
    petId: number;
    quantity: number;
    shipDate?: string;
    status: OrderStatus;
    complete: boolean;
}

export interface User {
    id?: number;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phone?: string;
    userStatus?: number;
}

export interface Inventory {
    [status: string]: number;
}

export type { PetstoreApiResponse } from '../error-response';
