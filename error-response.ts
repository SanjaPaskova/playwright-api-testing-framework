/**
 * Petstore Swagger v2 error body.
 * Every error endpoint returns the `ApiResponse` schema:
 * { code?: number, type?: string, message?: string }
 */

/** Petstore ApiResponse schema – returned by error endpoints and POST uploadImage. */
export type PetstoreApiResponse = {
  /** HTTP-like numeric code (e.g. 404, 1). */
  code?: number;
  /** e.g. "error", "unknown", "success" */
  type?: string;
  /** Human-readable message, e.g. "Pet not found". */
  message?: string;
};

/** Optional checks passed to expectPetstoreError(). */
export type PetstoreErrorExpectation = {
  /** Expected HTTP status code. */
  httpStatus: number;
  /** Assert body.type equals this value when present. */
  type?: string;
  /** Assert body.message contains this substring. */
  messageContains?: string;
};
