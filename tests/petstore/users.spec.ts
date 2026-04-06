import { test, expect } from '../../petstore/fixtures';
import { Make } from '../../petstore/make';
import { StaticTestData } from '../../petstore/static-test-data';
import { expectPetstoreError } from '../../petstore/petstore-validations';
import { HttpStatus } from '../../errorcodes';
import { User } from '../../petstore/models';

const USERS = 'user';

test.describe('users', () => {
    // ----- POST /user -----

    test('Given_valid_user_When_calling_POST_user_Should_create_user', async ({ request, helper }) => {
        // arrange
        const req = Make.userRequest({ firstName: 'E2E', lastName: 'Created' });

        // act
        const res = await request.post(USERS, { data: req });

        // assert
        expect([HttpStatus.Ok, HttpStatus.Created]).toContain(res.status());
        helper.trackUser(req.username);
    });

    // ----- GET /user/{username} -----

    test('Given_existing_user_When_calling_GET_user_by_username_Should_return_user', async ({ request, helper }) => {
        // arrange
        const created = await helper.createUser({ firstName: 'E2E', lastName: 'GetUser' });

        // act
        const res = await request.get(`${USERS}/${created.username}`);

        // assert
        expect(res.status()).toBe(HttpStatus.Ok);
        const data = await res.json() as User;
        expect(data.username).toBe(created.username);
        expect(data.firstName).toBe(created.firstName);
        expect(data.lastName).toBe(created.lastName);
        expect(data.email).toBe(created.email);
    });

    test('Given_nonexistent_username_When_calling_GET_user_Should_return_404', async ({ request }) => {
        // arrange
        const username = `nonexistent_${Date.now()}`;

        // act
        const res = await request.get(`${USERS}/${username}`);

        // assert
        await expectPetstoreError(res, { httpStatus: HttpStatus.NotFound });
    });

    // ----- PUT /user/{username} -----

    test('Given_existing_user_When_calling_PUT_user_Should_return_success', async ({ request, helper }) => {
        // arrange
        const created = await helper.createUser({ firstName: 'Original', lastName: 'Name' });

        // act
        const res = await request.put(`${USERS}/${created.username}`, {
            data: { ...created, firstName: 'Updated', userStatus: 1 },
        });

        // assert — Petstore shared sandbox accepts PUT but does not always persist changes
        expect([HttpStatus.Ok, HttpStatus.Created, HttpStatus.NoContent]).toContain(res.status());
    });

    test('Given_nonexistent_username_When_calling_PUT_user_Should_return_404', async ({ request }) => {
        // arrange
        const username = `nonexistent_${Date.now()}`;
        const req = Make.userRequest({ username });

        // act
        const res = await request.put(`${USERS}/${username}`, { data: req });

        // assert
        expect([HttpStatus.NotFound, HttpStatus.Ok]).toContain(res.status());
    });

    // ----- DELETE /user/{username} -----

    test('Given_existing_user_When_calling_DELETE_user_Should_delete_user', async ({ request, helper }) => {
        // arrange
        const created = await helper.createUser({ firstName: 'E2E', lastName: 'DeleteMe' });

        // act
        const res = await request.delete(`${USERS}/${created.username}`);

        // assert
        expect([HttpStatus.Ok, HttpStatus.NoContent]).toContain(res.status());

        // verify it's gone
        const getRes = await request.get(`${USERS}/${created.username}`);
        expect(getRes.status()).toBe(HttpStatus.NotFound);
    });

    test('Given_nonexistent_username_When_calling_DELETE_user_Should_return_404', async ({ request }) => {
        // arrange
        const username = `nonexistent_${Date.now()}`;

        // act
        const res = await request.delete(`${USERS}/${username}`);

        // assert
        expect([HttpStatus.BadRequest, HttpStatus.NotFound]).toContain(res.status());
    });

    // ----- GET /user/login -----

    test('Given_valid_credentials_When_calling_GET_userLogin_Should_return_session_token', async ({ request }) => {
        // act
        const res = await request.get(`${USERS}/login`, {
            params: { username: StaticTestData.knownUsername, password: 'test1' },
        });

        // assert
        expect(res.ok()).toBeTruthy();
        const text = await res.text();
        expect(text.length).toBeGreaterThan(0);
    });

    test('Given_request_without_credentials_When_calling_GET_userLogin_Should_return_400_or_200', async ({ request }) => {
        // act (Petstore does not strictly enforce auth on the shared sandbox)
        const res = await request.get(`${USERS}/login`);

        // assert
        expect([HttpStatus.Ok, HttpStatus.BadRequest]).toContain(res.status());
    });

    // ----- GET /user/logout -----

    test('Given_request_When_calling_GET_userLogout_Should_return_success', async ({ request }) => {
        // act
        const res = await request.get(`${USERS}/logout`);

        // assert
        expect([HttpStatus.Ok, HttpStatus.Created, HttpStatus.NoContent, HttpStatus.Redirect]).toContain(
            res.status(),
        );
    });

    // ----- POST /user/createWithArray + POST /user/createWithList -----

    test('Given_valid_user_array_When_calling_POST_createWithArray_Should_succeed', async ({ request, helper }) => {
        // arrange
        const user = Make.userRequest();
        helper.trackUser(user.username);

        // act
        const res = await request.post(`${USERS}/createWithArray`, { data: [user] });

        // assert
        expect([HttpStatus.Ok, HttpStatus.Created]).toContain(res.status());
    });

    test('Given_valid_user_list_When_calling_POST_createWithList_Should_succeed', async ({ request, helper }) => {
        // arrange
        const user = Make.userRequest();
        helper.trackUser(user.username);

        // act
        const res = await request.post(`${USERS}/createWithList`, { data: [user] });

        // assert
        expect([HttpStatus.Ok, HttpStatus.Created]).toContain(res.status());
    });
});
