/**
 * Petstore ApiResponse body `type` values.
 * The sandbox returns these strings in { code, type, message }.
 */
export const PetstoreResponseType = {
  /** Successful operation acknowledgement (e.g. delete, upload). */
  Unknown: 'unknown',
  /** Error acknowledgement returned alongside non-2xx codes. */
  Error: 'error',
} as const;

export type PetstoreResponseTypeValue = (typeof PetstoreResponseType)[keyof typeof PetstoreResponseType];

/**
 * Petstore ApiResponse body `code` values.
 * Numeric codes embedded in the JSON body alongside `type` and `message`.
 *
 * Endpoints + documented codes:
 *  GET  /pet/{petId}           → 400 Invalid ID, 404 Pet not found
 *  POST /pet                   → 405 Invalid input
 *  PUT  /pet                   → 400 Invalid ID, 404 Not found, 405 Validation exception
 *  DELETE /pet/{petId}         → 400 Invalid ID, 404 Pet not found
 *  GET  /pet/findByStatus      → 400 Invalid status value
 *  GET  /pet/findByTags        → 400 Invalid tag value
 *  POST /store/order           → 400 Invalid Order
 *  GET  /store/order/{orderId} → 400 Invalid ID, 404 Order not found
 *  DELETE /store/order/{id}    → 400 Invalid ID, 404 Order not found
 *  GET  /user/{username}       → 400 Invalid username, 404 User not found
 *  PUT  /user/{username}       → 400 Invalid user supplied, 404 User not found
 *  DELETE /user/{username}     → 400 Invalid username, 404 User not found
 *  GET  /user/login            → 400 Invalid username/password
 */
export const PetstoreCode = {
  /** Body code when a resource is not found (sandbox returns 1 or 404). */
  NotFound: 1,
  /** Body code echoing the HTTP 400 status. */
  BadRequest: 400,
  /** Body code echoing the HTTP 404 status. */
  NotFoundAlt: 404,
  /** Body code echoing the HTTP 405 status. */
  InvalidInput: 405,
} as const;

export type PetstoreCodeValue = (typeof PetstoreCode)[keyof typeof PetstoreCode];

/** Common HTTP status codes. */
export const HttpStatus = {
  Ok: 200,
  Created: 201,
  NoContent: 204,
  Redirect: 302,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  Conflict: 409,
  UnprocessableEntity: 422,
} as const;
