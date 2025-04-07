/**
 * MCP Tool Executor for setting the analysis complete flag
 *
 * This module implements the tool executor for setting the analysis complete flag.
 */

import { setAnalysisComplete, type AnalysisCompleteOptions } from '../operations/setConfirmationFlags'
import type { ToolExecutor } from '../../../types'
import type { StateManager } from '../stateManager'

/**
 * Factory function to create an executor for setting the analysis complete flag
 */
export function setAnalysisCompleteExecutor(stateManager: StateManager): ToolExecutor {
	return async (parameters) => {
		const options: AnalysisCompleteOptions = {
			isComplete: parameters.arguments.isComplete as boolean,
		}

		// The operation function already returns a properly formatted ToolResult
		return setAnalysisComplete(stateManager, options)
	}
}
