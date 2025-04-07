/**
 * Issue Creation Wizard GetStatus Tool Executor
 *
 * This module implements the execution function for the getStatus tool.
 * It retrieves status information about the issue creation wizard.
 */

import { calculateProgress, calculateStepCompletion } from '../utils/statusUtils'
import { createSuccessResult, createErrorResult } from './utils'
import type { ToolExecutor } from '../../../types'
import type { StateManager } from '../stateManager'
import type { WizardStatus } from '../types'

/**
 * Get the status of the issue creation wizard
 *
 * This function provides detailed information about the current status
 * of the wizard including:
 * - Whether a wizard is active
 * - Current step in the process
 * - Time elapsed since last update
 * - Progress information
 * - Any validation errors
 */
export function getStatusWizardToolExecutor(stateManager: StateManager): ToolExecutor {
	return async function (): Promise<ReturnType<typeof createSuccessResult>> {
		try {
			const isActive = stateManager.isActive()

			// Initialize basic status object
			const status: WizardStatus = {
				active: isActive,
				timeElapsed: 0,
			}

			// If no active wizard, return simple inactive status
			if (!isActive) {
				return createSuccessResult(status)
			}

			// Get details for active wizard
			const stateResult = stateManager.getState()

			// Handle error in retrieving state
			if (!stateResult.success) {
				return createErrorResult('Failed to retrieve wizard state details')
			}

			// Populate status with details from state
			const state = stateResult.data
			status.currentStep = state.currentStep
			status.timestamp = state.timestamp

			// Calculate time elapsed since last update
			const now = Date.now()
			status.timeElapsed = Math.floor((now - state.timestamp) / 1000) // seconds

			// Add progress information
			status.progress = calculateProgress(state.currentStep)

			// Add validation information if there are errors
			const hasValidationErrors = Object.keys(state.validation.errors).length > 0
			if (hasValidationErrors) {
				status.hasValidationErrors = true
				status.validationErrorCount = Object.keys(state.validation.errors).length
			}

			// Add completion information for current step
			status.stepCompletion = calculateStepCompletion(state)

			return createSuccessResult(status)
		} catch (error) {
			return createErrorResult((error as Error).message)
		}
	}
}
