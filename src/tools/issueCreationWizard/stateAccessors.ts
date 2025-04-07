/**
 * Issue Creation Wizard State Accessors
 *
 * This module provides helper functions for managing the state in the StateManager class.
 * These functions separate the access patterns from the main class implementation.
 */

import { createError, createSuccess, ErrorCode } from '../../errors/types'
import type { WizardState } from './types'
import type { ErrorResult } from '../../errors/types'

/**
 * Check if a state is active
 * @param state The state to check
 */
export function isStateActive(state: WizardState | null): boolean {
	return state !== null && state.active
}

/**
 * Get error for no active wizard
 */
export function getNoActiveWizardError(): ErrorResult {
	return createError(ErrorCode.INVALID_PARAMETERS, 'No active wizard found')
}

/**
 * Get error for already active wizard
 */
export function getAlreadyActiveWizardError(): ErrorResult {
	return createError(ErrorCode.INVALID_PARAMETERS, 'A wizard is already in progress. Reset the state first.')
}

/**
 * Create a reset success result
 */
export function createResetResult(): { success: true; data: { reset: boolean } } {
	return createSuccess({ reset: true })
}
