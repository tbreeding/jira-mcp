/**
 * Issue Creation Wizard GetState Tool Executor
 *
 * This module implements the execution function for the getState tool.
 * It retrieves the current state of the issue creation wizard.
 */

import { createSuccessResult, createErrorResult } from './utils'
import type { ToolExecutor } from '../../../types'
import type { StateManager } from '../stateManager'

/**
 * Get the current state of the issue creation wizard
 * @param stateManager - The state manager instance to use
 */
export function getStateWizardToolExecutor(stateManager: StateManager): ToolExecutor {
	return async function (): Promise<ReturnType<typeof createSuccessResult>> {
		try {
			const result = stateManager.getState()

			if (!result.success) {
				return createErrorResult(result.error.message)
			}

			return createSuccessResult(result.data)
		} catch (error) {
			return createErrorResult((error as Error).message)
		}
	}
}
