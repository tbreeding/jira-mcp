/**
 * Unit tests for verifyStateUpdate
 */

import { verifyStateUpdate } from '../verifyStateUpdate'
import { WizardStep } from '../../types'
import type { WizardState } from '../../types'

describe('verifyStateUpdate', () => {
	const baseState: WizardState = {
		active: true,
		currentStep: WizardStep.INITIATE,
		fields: {},
		validation: {
			errors: {},
			warnings: {},
		},
		timestamp: Date.now(),
	}

	it('should return null when step matches currentStep', () => {
		const result = verifyStateUpdate(WizardStep.INITIATE, baseState)
		expect(result).toBeNull()
	})

	it('should return error message when step does not match currentStep', () => {
		const result = verifyStateUpdate(WizardStep.PROJECT_SELECTION, baseState)
		expect(result).toBe('State update verification failed: currentStep was not updated correctly')
	})

	it('should return null when step is undefined', () => {
		const result = verifyStateUpdate(undefined, baseState)
		expect(result).toBeNull()
	})
})
