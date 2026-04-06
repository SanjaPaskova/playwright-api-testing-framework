# Playwright API smoke tests

Playwright-based API integration tests targeting the [Petstore v2](https://petstore.swagger.io/v2/swagger.json) public sandbox. All tests are HTTP-only (no browser required).

## Installation and running

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- Network access to `petstore.swagger.io`

### Step 1 — Navigate to the project folder

```bash
cd playwright-api-testing-framework
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Install Playwright browsers (first time only)

These tests are HTTP-only and do not launch a browser, but Playwright still requires at least one browser to be present.

```bash
npm run install:browsers
```

### Step 4 — Run all tests

```bash
npm test
```

### Optional — Run a single spec file

```bash
npx playwright test tests/petstore/pets.spec.ts
```

### Optional — Run tests matching a name pattern

```bash
npx playwright test --grep "POST"
```

### Optional — Override the API base URL

```bash
PETSTORE_BASE_URL=https://petstore.swagger.io/v2 npm test
```

### Optional — Run tests with an API key

The Petstore accepts an `api_key` request header for authenticated endpoints. Set `PETSTORE_API_KEY` to include it on every request:

```bash
PETSTORE_API_KEY=special-key npm test
```

### Optional — Override login credentials

The `sessionToken` fixture logs in via `GET /user/login` before tests that need it. Credentials default to `user1` / `test1` (pre-seeded on the public sandbox) and can be overridden:

```bash
PETSTORE_USERNAME=myuser PETSTORE_PASSWORD=mypass npm test
```

## Project structure

```
playwright-api-testing-framework/
│
├── tests/
│   └── petstore/                  # One spec file per resource group
│       ├── pets.spec.ts           # /pet endpoints (CRUD, findByStatus, findByTags, upload)
│       ├── store.spec.ts          # /store endpoints (inventory, orders)
│       ├── users.spec.ts          # /user endpoints (CRUD, login/logout)
│       └── validations.spec.ts    # Cross-cutting status + error-shape checks
│
├── petstore/                      # Petstore-domain support layer
│   ├── models.ts                  # TypeScript interfaces (Pet, Order, User, requests/responses)
│   ├── make.ts                    # Test data builders (mirrors C# Make pattern)
│   ├── static-test-data.ts        # Pre-seeded / boundary test values (known IDs, invalid IDs)
│   ├── data-setup-helper.ts       # Per-test resource tracker; auto-cleans up after each test
│   ├── fixtures.ts                # Playwright fixture extending `test` with `helper` injection
│   └── validations.ts             # Petstore-specific assertion helpers
│
├── helpers/                       # Generic utilities
│   ├── generate-random.ts         # Random string generator (lowercase + digits)
│   └── json-helper.ts             # Typed JSON.parse wrapper
│
├── validations.ts                 # Shared response-level assertions (expectStatus, expectSuccess,
│                                  #   expectNotFound, expectClientError)
├── error-response.ts              # PetstoreApiResponse type + PetstoreErrorExpectation type
├── errorcodes.ts                  # HttpStatus and PetstoreCode/PetstoreResponseType constants
├── globalconstants.ts             # Base URL resolution, env-var key, shared HTTP headers
├── playwright.config.ts           # Playwright configuration (testDir, baseURL, default headers)
├── tsconfig.json                  # TypeScript compiler options
└── package.json                   # Dependencies and npm scripts
```

## Key concepts

### Test fixtures (`petstore/fixtures.ts`)
Extends the Playwright `test` object with two fixtures per test:
- **`helper`** — a `DataSetupHelper` that tracks and auto-deletes resources created during the test (mirrors the C# `IAsyncLifetime` pattern)
- **`sessionToken`** — logs in via `GET /user/login` and provides the returned session token

```ts
import { test, expect } from '../../petstore/fixtures';

test('...', async ({ request, helper }) => {
  const pet = await helper.createPet({ name: 'Fido', photoUrls: [] });
  // pet is deleted automatically after the test
});

test('...authenticated...', async ({ request, sessionToken }) => {
  const res = await request.get('pet/1', {
    headers: { Authorization: sessionToken },
  });
});
```

### Data builders (`petstore/make.ts`)
Factory functions that produce valid request bodies with randomised fields. Mirrors the C# `Make` builder pattern in `portal-e2e-api-tests.Shared`.

### Validation helpers (`validations.ts`, `petstore/validations.ts`)
Assertion utilities that provide clear failure messages and accept lists of allowed status codes to handle sandbox variability (e.g. `expectStatus(res, [200, 404])`).

### Error constants (`errorcodes.ts`)
`HttpStatus` — named HTTP status code values.  
`PetstoreCode` — numeric codes embedded in Petstore error response bodies.  
`PetstoreResponseType` — `type` string values returned in error bodies (`"error"`, `"unknown"`).

## Configuration

| Environment variable | Default | Description |
|---|---|---|
| `PETSTORE_BASE_URL` | `https://petstore.swagger.io/v2` | Override the Petstore base URL. Trailing slash is normalised automatically. |
| `PETSTORE_API_KEY` | _(none)_ | When set, sent as the `api_key` header on every request. |
| `PETSTORE_USERNAME` | `user1` | Username used by the `sessionToken` fixture to log in. |
| `PETSTORE_PASSWORD` | `test1` | Password used by the `sessionToken` fixture to log in. |

## Test results

Requires network access to `petstore.swagger.io`. 37 of 39 tests pass reliably. Known flaky tests on the shared sandbox:
- `pending` findByStatus — server returns an enormous payload that exhausts the 30 s timeout
- `GET /store/inventory` — intermittently returns 500 from the shared sandbox
