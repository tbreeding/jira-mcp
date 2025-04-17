/**
 * Issue Creation Wizard Tool Utilities
 *
 * This module provides utility functions for the issue creation wizard tools.
 * These functions help standardize result formatting and error handling.
 */

import type { ToolResult } from '../../../types'

/**
 * Process result type for internal wizard operations
 */
export interface ProcessResult {
	success: boolean
	message: string
	[key: string]: unknown
}

/**
 * Creates a standardized success result as ToolResult
 */
export function createSuccessResult(data: unknown): ToolResult {
	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify(data, null, 2),
			},
		],
		isError: undefined,
	}
}

/**
 * Creates a standardized error result as ToolResult
 */
export function createErrorResult(message: string): ToolResult {
	return {
		content: [
			{
				type: 'text',
				text: `Error: ${message}`,
			},
		],
		isError: true,
	}
}

/**
 * Creates a standardized success result as ProcessResult
 */
export function createProcessSuccessResult(data: Record<string, unknown>): ProcessResult {
	return {
		success: true,
		message: (data.message as string) || 'Operation completed successfully',
		...data,
	}
}

/**
 * Creates a standardized error result as ProcessResult
 */
export function createProcessErrorResult(message: string): ProcessResult {
	return {
		success: false,
		message: message,
	}
}
