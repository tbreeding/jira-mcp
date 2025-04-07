/**
 * Unit tests for the Issue Creation Wizard State Serialization
 */

import { serializeState, deserializeState } from '../stateSerialization'
import { WizardStep } from '../types'
import type { WizardState } from '../types'

describe('State Serialization', () => {
	const validState: WizardState = {
		active: true,
		currentStep: WizardStep.PROJECT_SELECTION,
		projectKey: 'TEST-1',
		fields: {
			description: 'Test description',
		},
		validation: {
			errors: {},
			warnings: {},
		},
		timestamp: Date.now(),
	}

	it('should serialize a valid state', () => {
		const result = serializeState(validState)
		expect(result.success).toBe(true)
		if (result.success) {
			expect(typeof result.data).toBe('string')
			expect(JSON.parse(result.data)).toEqual(validState)
		}
	})

	it('should handle serialization error for circular references', () => {
		// Create an object with circular reference that will cause JSON.stringify to throw
		const stateWithCircularRef: any = {
			...validState,
			circular: {},
		}
		stateWithCircularRef.circular.self = stateWithCircularRef // Create circular reference

		const result = serializeState(stateWithCircularRef as WizardState)
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('UNKNOWN_ERROR')
			expect(result.error.message).toBe('Failed to serialize state')
		}
	})

	it('should deserialize a valid serialized state', () => {
		const serialized = JSON.stringify(validState)
		const result = deserializeState(serialized)

		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data).toEqual(validState)
		}
	})

	it('should reject invalid serialized data', () => {
		const invalidJson = '{ invalid json }'
		const result = deserializeState(invalidJson)

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('UNKNOWN_ERROR')
		}
	})

	it('should reject serialized data that is not a wizard state', () => {
		const invalidState = JSON.stringify({
			foo: 'bar',
		})
		const result = deserializeState(invalidState)

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('INVALID_PARAMETERS')
		}
	})

	it('should reject serialized state with invalid step', () => {
		const invalidState = JSON.stringify({
			active: true,
			currentStep: 'invalid_step',
			fields: {},
			validation: {
				errors: {},
				warnings: {},
			},
			timestamp: Date.now(),
		})
		const result = deserializeState(invalidState)

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('INVALID_PARAMETERS')
		}
	})
})
