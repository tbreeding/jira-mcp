/**
 * Error types and definitions for the application
 */

/** Possible error codes for domain-specific errors */
export enum ErrorCode {
	UNKNOWN_ERROR = 'UNKNOWN_ERROR',
	INVALID_PARAMETERS = 'INVALID_PARAMETERS',
	TOOL_NOT_FOUND = 'TOOL_NOT_FOUND',
	TOOL_EXECUTION_ERROR = 'TOOL_EXECUTION_ERROR',
	REQUEST_VALIDATION_ERROR = 'REQUEST_VALIDATION_ERROR',
	SERVER_ERROR = 'SERVER_ERROR',
}

/** Base interface for error objects */
export interface ErrorObject {
	code: ErrorCode | string
	message: string
	metadata?: Record<string, unknown>
	originalError?: Error | unknown
}

/** Error severity levels */
export enum ErrorSeverity {
	LOW = 'LOW',
	MEDIUM = 'MEDIUM',
	HIGH = 'HIGH',
	CRITICAL = 'CRITICAL',
}

/** Success result from operations */
export interface SuccessResult<T> {
	success: true
	data: T
}

/** Generic Error result using standard Error type */
interface StandardErrorResult<E extends Error = Error> {
	success: false
	error: E
}

/** Represents the outcome of an operation that can succeed or fail (using standard Error) */
export type Result<T, E extends Error = Error> = SuccessResult<T> | StandardErrorResult<E>

/** Original Error result shape using ErrorObject (exported for compatibility) */
export interface ErrorResult {
	success: false
	error: ErrorObject
}

/**
 * Create a success result
 * @param data - The data to return
 */
export function createSuccess<T>(data: T): SuccessResult<T> {
	return {
		success: true,
		data,
	}
}

/**
 * Create an error result
 * @param code - Error code
 * @param message - Error message
 * @param metadata - Additional error metadata
 * @param originalError - Original error if wrapping
 */
export function createError(
	code: ErrorCode | string,
	message: string,
	metadata?: Record<string, unknown>,
	originalError?: Error | unknown,
): ErrorResult {
	return {
		success: false,
		error: {
			code,
			message,
			metadata,
			originalError,
		},
	}
}
