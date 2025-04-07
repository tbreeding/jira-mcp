/**
 * Issue Creation Wizard State Serialization
 *
 * This module provides functions for serializing and deserializing the
 * wizard state. This enables persistence and recovery of state between sessions.
 */

import { createError, createSuccess, ErrorCode } from '../../errors/types'
import { WizardStep } from './types'
import type { WizardState } from './types'
import type { ErrorResult } from '../../errors/types'

/**
 * Serialize the state to JSON string
 * @param state The wizard state to serialize
 */
export function serializeState(state: WizardState): { success: true; data: string } | ErrorResult {
	try {
		const serialized = JSON.stringify(state)
		return createSuccess(serialized)
	} catch (error) {
		return createError(ErrorCode.UNKNOWN_ERROR, 'Failed to serialize state', {}, error)
	}
}

/**
 * Deserialize the state from JSON string
 * @param serializedState Serialized state string
 */
export function deserializeState(serializedState: string): { success: true; data: WizardState } | ErrorResult {
	try {
		const parsedState = JSON.parse(serializedState) as WizardState

		// Basic validation that this is a wizard state
		if (
			typeof parsedState !== 'object' ||
			typeof parsedState.active !== 'boolean' ||
			!Object.values(WizardStep).includes(parsedState.currentStep)
		) {
			return createError(ErrorCode.INVALID_PARAMETERS, 'Invalid state format')
		}

		return createSuccess(parsedState)
	} catch (error) {
		return createError(ErrorCode.UNKNOWN_ERROR, 'Failed to deserialize state', {}, error)
	}
}
