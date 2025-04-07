/**
 * MCP Tool Executor for setting the user confirmation flag
 *
 * This module implements the tool executor for setting the user confirmation flag.
 */

import { setUserConfirmation, type UserConfirmationOptions } from '../operations/setConfirmationFlags'
import type { ToolExecutor } from '../../../types'
import type { StateManager } from '../stateManager'

/**
 * Factory function to create an executor for setting the user confirmation flag
 */
export function setUserConfirmationExecutor(stateManager: StateManager): ToolExecutor {
	return async (parameters) => {
		const options: UserConfirmationOptions = {
			confirmed: parameters.arguments.confirmed as boolean,
		}

		// The operation function already returns a properly formatted ToolResult
		return setUserConfirmation(stateManager, options)
	}
}
