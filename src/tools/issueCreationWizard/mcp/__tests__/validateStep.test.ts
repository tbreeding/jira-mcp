/**
 * Unit tests for validateStep
 */

import { validateStep } from '../validateStep'
import { WizardStep } from '../../types'

describe('validateStep', () => {
	it('should return null for valid steps', () => {
		const result = validateStep(WizardStep.INITIATE)
		expect(result).toBeNull()
	})

	it('should return error message for invalid steps', () => {
		const invalidStep = 'INVALID_STEP'
		const result = validateStep(invalidStep)
		expect(result).toContain(`Invalid step: ${invalidStep}`)
	})

	it('should return null when step is undefined', () => {
		const result = validateStep(undefined)
		expect(result).toBeNull()
	})
})
