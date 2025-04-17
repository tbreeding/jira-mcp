import { hasCachedFieldMetadata } from '../mcp/hasCachedFieldMetadata'
import type { WizardState } from '../types'

describe('hasCachedFieldMetadata', () => {
	test('should return false when wizardStateResult.success is false', () => {
		const result = hasCachedFieldMetadata({
			success: false,
			error: { message: 'Error', code: 'ERROR' },
		})

		expect(result).toBe(false)
	})

	test('should return false when analysis is undefined', () => {
		const wizardState = {} as WizardState

		const result = hasCachedFieldMetadata({
			success: true,
			data: wizardState,
		})

		expect(result).toBe(false)
	})

	test('should return false when analysis.metadata is undefined', () => {
		const wizardState = {
			analysis: {},
		} as unknown as WizardState

		const result = hasCachedFieldMetadata({
			success: true,
			data: wizardState,
		})

		expect(result).toBe(false)
	})

	test('should return false when analysis.metadata.required is not an array', () => {
		const wizardState = {
			analysis: {
				metadata: {
					required: 'not an array',
				},
			},
		} as unknown as WizardState

		const result = hasCachedFieldMetadata({
			success: true,
			data: wizardState,
		})

		expect(result).toBe(false)
	})

	test('should return false when analysis.metadata.required is an empty array', () => {
		const wizardState = {
			analysis: {
				metadata: {
					required: [],
				},
			},
		} as unknown as WizardState

		const result = hasCachedFieldMetadata({
			success: true,
			data: wizardState,
		})

		expect(result).toBe(false)
	})

	test('should return true when all conditions are met', () => {
		const wizardState = {
			analysis: {
				metadata: {
					required: ['field1', 'field2'],
				},
			},
		} as unknown as WizardState

		const result = hasCachedFieldMetadata({
			success: true,
			data: wizardState,
		})

		expect(result).toBe(true)
	})
})
