/**
 * Operations for setting user confirmation and analysis completion flags
 *
 * This module provides functions to update the userConfirmation and analysisComplete
 * flags in the wizard state.
 */

import { createErrorResult, createSuccessResult } from '../mcp/utils'
import type { StateManager } from '../stateManager'

/**
 * Options for the setAnalysisComplete function
 */
export interface AnalysisCompleteOptions {
	isComplete: boolean
}

/**
 * Set the analysis complete flag in the wizard state
 */
export function setAnalysisComplete(
	stateManager: StateManager,
	options: AnalysisCompleteOptions,
): ReturnType<typeof createSuccessResult | typeof createErrorResult> {
	try {
		const stateResult = stateManager.getState()
		if (!stateResult.success) {
			return createErrorResult('No active wizard session found')
		}

		// We only need to check if state exists, not use it
		const updatedState = {
			analysisComplete: options.isComplete,
		}

		const setResult = stateManager.updateState(updatedState)
		if (!setResult.success) {
			return createErrorResult(`Failed to update state: ${setResult.error.message}`)
		}

		return createSuccessResult({
			message: `Analysis status updated to: ${options.isComplete}`,
		})
	} catch (error) {
		return createErrorResult(`Failed to update analysis status: ${(error as Error).message}`)
	}
}

/**
 * Options for the setUserConfirmation function
 */
export interface UserConfirmationOptions {
	confirmed: boolean
}

/**
 * Set the user confirmation flag in the wizard state
 */
export function setUserConfirmation(
	stateManager: StateManager,
	options: UserConfirmationOptions,
): ReturnType<typeof createSuccessResult | typeof createErrorResult> {
	try {
		const stateResult = stateManager.getState()
		if (!stateResult.success) {
			return createErrorResult('No active wizard session found')
		}

		// We only need to check if state exists, not use it
		const updatedState = {
			userConfirmation: options.confirmed,
		}

		const setResult = stateManager.updateState(updatedState)
		if (!setResult.success) {
			return createErrorResult(`Failed to update state: ${setResult.error.message}`)
		}

		return createSuccessResult({
			message: `User confirmation updated to: ${options.confirmed}`,
		})
	} catch (error) {
		return createErrorResult(`Failed to update user confirmation: ${(error as Error).message}`)
	}
}
