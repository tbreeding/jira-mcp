/**
 *Error Handling Wrapper for Tool Executors
 *
 *This module provides a utility function for standardized error handling
 *for tool executors in the Issue Creation Wizard.
 */

import { safeExecute } from '../../../errors/handlers'
import { ErrorCode } from '../../../errors/types'
import type { ToolExecutor, ToolResult } from '../../../types'

/**
 *Wraps a tool executor with standardized error handling
 *@param executor - The raw tool executor function
 *@returns A wrapped executor with error handling
 */
export function wrapExecutorWithErrorHandling(executor: ToolExecutor): ToolExecutor {
	return async function (parameters: { arguments: Record<string, unknown> }): Promise<ToolResult> {
		const result = await safeExecute(
			() => executor(parameters),
			'Issue Creation Wizard tool execution failed',
			ErrorCode.TOOL_EXECUTION_ERROR,
		)

		// Return error result
		if (!result.success) {
			const errorMessage = `Error: ${result.error?.message}`
			return {
				content: [
					{
						type: 'text',
						text: errorMessage,
					},
				],
				isError: true,
			}
		}

		// Return success result
		return result.data
	}
}
