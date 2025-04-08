/**
 * Issue Creation Wizard InitiateState Tool Executor
 *
 * This module implements the execution function for the initiateState tool.
 * It initializes a new state for the issue creation wizard, primarily for
 * testing state persistence between tool calls.
 */

import { createSuccessResult, createErrorResult } from './utils'
import type { ToolExecutor } from '../../../types'
import type { StateManager } from '../stateManager'

/**
 * Initialize a new state for the issue creation wizard
 */
export function initiateStateWizardToolExecutor(stateManager: StateManager): ToolExecutor {
	return async function (): Promise<ReturnType<typeof createSuccessResult>> {
		try {
			// Check if a wizard is already active
			if (stateManager.isActive()) {
				return createErrorResult(
					'A wizard session is already active. Please call issueCreation_resetState first if you want to start a new session.',
				)
			}

			const result = stateManager.initializeState()

			if (!result.success) {
				return createErrorResult(result.error.message)
			}

			return createSuccessResult({
				success: true,
				message: 'Wizard state initialized successfully',
				state: result.data,
				sessionId: result.data.timestamp,
			})
		} catch (error) {
			return createErrorResult((error as Error).message)
		}
	}
}
