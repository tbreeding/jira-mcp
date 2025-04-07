/**
 * Issue Creation Wizard ResetState Tool Executor
 *
 * This module implements the execution function for the resetState tool.
 * It resets the state of the issue creation wizard.
 */

import { createSuccessResult, createErrorResult } from './utils'
import type { ToolExecutor } from '../../../types'
import type { StateManager } from '../stateManager'

/**
 * Reset the state of the issue creation wizard
 */
export function resetStateWizardToolExecutor(stateManager: StateManager): ToolExecutor {
	return async function (): Promise<ReturnType<typeof createSuccessResult>> {
		try {
			const result = stateManager.resetState()
			return createSuccessResult(result.data)
		} catch (error) {
			return createErrorResult((error as Error).message)
		}
	}
}
