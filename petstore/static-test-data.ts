/**
 * Known / pre-seeded test data references for the Petstore API.
 */
export const StaticTestData = {
    // Pre-seeded usernames on swagger.io/v2 (user1..user10)
    knownUsername: 'user1',

    // Petstore treats id ≤ 0 as an invalid / bad-request value
    invalidPetId: 0,
    invalidOrderId: 0,

    // A numeric string that will never parse as integer – triggers 400 on the server
    malformedId: 'not-a-number',

    // A very large ID reliably absent on the shared Petstore server
    nonexistentPetId: 999_999_999_999,
    nonexistentOrderId: 999_999,

    // Valid store order-id range seeded on the shared server (1–10)
    validOrderIdMin: 1,
    validOrderIdMax: 10,

    // Default photo URL used when creating pets
    defaultPhotoUrl: 'https://example.com/pet.png',
} as const;
