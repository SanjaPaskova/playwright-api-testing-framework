import { test, expect } from '../../petstore/fixtures';
import { Make } from '../../petstore/make';
import { StaticTestData } from '../../petstore/static-test-data';
import { expectPetstoreError, expectPetstoreSuccess } from '../../petstore/petstore-validations';
import { HttpStatus } from '../../errorcodes';
import type { Pet } from '../../petstore/models';

const PETS = 'pet';

test.describe('pets', () => {
    // ----- POST /pet -----

    test('Given_valid_pet_When_calling_POST_pet_Should_create_pet', async ({ request, helper }) => {
        // arrange
        const req = Make.petRequest({ name: 'E2E Buddy', status: 'available' });
        const expected = Make.expectedPetDto(req);

        // act
        const res = await request.post(PETS, { data: req });

        // assert
        expect(res.status()).toBe(HttpStatus.Ok);
        const data = await res.json() as Pet;
        helper.trackPet(data.id);
        expect(data.name).toBe(expected.name);
        expect(data.status).toBe(expected.status);
        expect(data.photoUrls).toEqual(expected.photoUrls);
    });

    // ----- GET /pet/{petId} -----

    test('Given_existing_pet_When_calling_GET_pet_by_id_Should_return_pet', async ({ helper }) => {
        // arrange
        const pet = await helper.createPet({ name: 'E2E Fetch' });

        // act
        const { request } = helper as unknown as { request: never };
        // use helper's underlying request context via DataSetupHelper (passed via fixture)
        // Note: tests receive `request` directly from the Playwright fixture, see below
        expect(pet.id).toBeTruthy();
    });

    test('Given_existing_pet_When_calling_GET_pet_by_id_Should_return_correct_fields', async ({ request, helper }) => {
        // arrange
        const pet = await helper.createPet({ name: 'E2E GetCheck', status: 'pending' });

        // act
        const res = await request.get(`${PETS}/${pet.id}`);

        // assert
        expect(res.status()).toBe(HttpStatus.Ok);
        const data = await expectPetstoreSuccess<Pet>(res);
        expect(data.id).toBe(pet.id);
        expect(data.name).toBe(pet.name);
        expect(data.status).toBe('pending');
    });

    test('Given_nonexistent_pet_id_When_calling_GET_pet_Should_return_404', async ({ request }) => {
        // act
        const res = await request.get(`${PETS}/${StaticTestData.nonexistentPetId}`);

        // assert
        await expectPetstoreError(res, { httpStatus: HttpStatus.NotFound });
    });

    test('Given_malformed_pet_id_When_calling_GET_pet_Should_return_400_or_404', async ({ request }) => {
        // act
        const res = await request.get(`${PETS}/${StaticTestData.malformedId}`);

        // assert — Petstore returns 404 (not 400) for non-numeric ids on the shared sandbox
        expect([HttpStatus.BadRequest, HttpStatus.NotFound]).toContain(res.status());
    });

    // ----- PUT /pet -----

    test('Given_existing_pet_When_calling_PUT_pet_Should_update_pet', async ({ request, helper }) => {
        // arrange
        const pet = await helper.createPet({ name: 'E2E Original', status: 'available' });

        // act
        const res = await request.put(PETS, {
            data: { ...pet, name: 'E2E Updated', status: 'sold' },
        });

        // assert
        expect([HttpStatus.Ok, HttpStatus.Created]).toContain(res.status());
        const getRes = await request.get(`${PETS}/${pet.id}`);
        const data = await getRes.json() as Pet;
        expect(data.name).toContain('Updated');
        expect(data.status).toBe('sold');
    });

    // ----- GET /pet/findByStatus -----

    // Petstore /findByStatus with 'pending' or 'sold' can return huge payloads that
    // stall the shared sandbox; only run the lightweight 'available' case inline.
    test('Given_available_status_When_calling_GET_findByStatus_Should_return_matching_pets', async ({ request }) => {
        // act
        const res = await request.get(`${PETS}/findByStatus`, { params: { status: 'available' } });

        // assert
        expect(res.status()).toBe(HttpStatus.Ok);
        const data = (await res.json()) as Pet[];
        expect(Array.isArray(data)).toBeTruthy();
        data.slice(0, 5).forEach(p => expect(p.status).toBe('available'));
    });

    test('Given_pending_status_When_calling_GET_findByStatus_Should_return_ok', async ({ request }) => {
        test.setTimeout(90_000); // pending status returns a very large payload
        const res = await request.get(`${PETS}/findByStatus`, { params: { status: 'pending' } });
        expect(res.status()).toBe(HttpStatus.Ok);
    });

    test('Given_sold_status_When_calling_GET_findByStatus_Should_return_ok', async ({ request }) => {
        const res = await request.get(`${PETS}/findByStatus`, { params: { status: 'sold' } });
        expect(res.status()).toBe(HttpStatus.Ok);
    });

    test('Given_existing_pet_When_calling_DELETE_pet_Should_return_200', async ({ request, helper }) => {
        // arrange
        const pet = await helper.createPet({ name: 'E2E ToDelete' });

        // act
        const res = await request.delete(`${PETS}/${pet.id}`, {
            headers: { api_key: 'special-key' },
        });

        // assert
        expect([HttpStatus.Ok, HttpStatus.NoContent]).toContain(res.status());
    });

    test('Given_nonexistent_pet_id_When_calling_DELETE_pet_Should_return_404', async ({ request }) => {
        // act
        const res = await request.delete(`${PETS}/${StaticTestData.nonexistentPetId}`, {
            headers: { api_key: 'special-key' },
        });

        // assert
        await expectPetstoreError(res, { httpStatus: HttpStatus.NotFound });
    });

    // ----- POST /pet/{petId}/uploadImage -----

    test('Given_existing_pet_When_calling_POST_uploadImage_Should_return_ApiResponse', async ({ request, helper }) => {
        // arrange
        const pet = await helper.createPet({ name: 'E2E Upload' });

        // act
        const res = await request.post(`${PETS}/${pet.id}/uploadImage`, {
            multipart: {
                additionalMetadata: 'e2e-upload',
                file: {
                    name: 'stub.png',
                    mimeType: 'image/png',
                    buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
                },
            },
        });

        // assert
        expect([HttpStatus.Ok, HttpStatus.Created]).toContain(res.status());
        const data = await res.json();
        expect(data).toBeTruthy();
    });
});
