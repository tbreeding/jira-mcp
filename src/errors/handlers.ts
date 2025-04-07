/**
 * Error handling utilities for the application
 *
 * This file provides standardized error handling patterns, including error
 * normalization, safe execution with consistent error formatting, and methods
 * for logging errors in a structured way across the application.
 */

import { log } from '../utils/logger'
import { createError, ErrorCode } from './types'
import type { ErrorObject, ErrorResult } from './types'

/**
 * Check if an object has error structure
 */
function isErrorLike(error: unknown): error is ErrorObject {
	return typeof error === 'object' && error !== null && 'code' in error && 'message' in error
}

/**
 * Convert an unknown error to a structured error object
 * @param error - The error to convert
 */
export function normalizeError(error: unknown): ErrorObject {
	// First check if it's an error object
	if (isErrorLike(error)) {
		return error as ErrorObject
	}

	// If standard Error object
	if (error instanceof Error) {
		return {
			code: ErrorCode.UNKNOWN_ERROR,
			message: error.message || 'An unknown error occurred',
			originalError: error,
		}
	}

	// For other types (string, number, etc.)
	return {
		code: ErrorCode.UNKNOWN_ERROR,
		message: String(error) || 'An unknown error occurred',
		originalError: error,
	}
}

/**
 * Safely execute a function and return a Result
 * @param fn - Function to execute safely
 * @param errorMessage - Message to use if an error occurs
 * @param errorCode - Error code to use if an error occurs
 */
export async function safeExecute<T>(
	fn: () => Promise<T> | T,
	errorMessage = 'Operation failed',
	errorCode = ErrorCode.UNKNOWN_ERROR,
): Promise<ErrorResult | { success: true; data: T }> {
	try {
		const result = await fn()
		return {
			success: true,
			data: result,
		}
	} catch (error) {
		log(`ERROR: ${errorMessage}: ${error}`)
		return createError(errorCode, errorMessage, {}, error)
	}
}

/**
 * Log an error with appropriate level
 * @param error - Error to log
 */
export function logError(error: ErrorObject | Error | unknown): void {
	const normalizedError = normalizeError(error)

	log(
		`ERROR: Error [${normalizedError.code}]: ${normalizedError.message}` +
			(normalizedError.metadata ? ` | Metadata: ${JSON.stringify(normalizedError.metadata)}` : ''),
	)
}

/**
 * Convert MCP Error to our internal error format
 * @param mcpError - Error from MCP SDK
 */
export function fromMcpError(mcpError: unknown): ErrorObject {
	// Handle errors from the MCP SDK
	const typedError = mcpError as { code?: string; message?: string }
	return {
		code: typedError.code || ErrorCode.UNKNOWN_ERROR,
		message: typedError.message || 'Unknown MCP error',
		metadata: {
			mcpErrorCode: typedError.code,
		},
		originalError: mcpError,
	}
}
