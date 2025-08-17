/**
 * Base response interface for all API responses
 */
export interface ApiResponse<T = unknown> {
  /**
   * Indicates if the operation was successful
   */
  readonly success: boolean;

  /**
   * Optional error message in case of failure
   */
  readonly error?: string;

  /**
   * Optional data payload in case of success
   */
  readonly data?: T;
}

/**
 * Standard success response with data
 */
export interface SuccessResponse<T> extends ApiResponse<T> {
  readonly success: true;
  readonly data: T;
}

/**
 * Standard error response
 */
export interface ErrorResponse extends ApiResponse {
  readonly success: false;
  readonly error: string;
}
