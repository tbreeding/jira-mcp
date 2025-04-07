import { WizardStep } from '../../types'
import { calculateProgress, calculateStepCompletion } from '../statusUtils'
import type { WizardState } from '../../types'

describe('statusUtils', () => {
	describe('calculateProgress', () => {
		it('should return correct progress percentage for initiate step', () => {
			expect(calculateProgress('initiate')).toBe(0)
		})

		it('should return correct progress percentage for project_selection step', () => {
			expect(calculateProgress('project_selection')).toBe(20)
		})

		it('should return correct progress percentage for issue_type_selection step', () => {
			expect(calculateProgress('issue_type_selection')).toBe(40)
		})

		it('should return correct progress percentage for field_completion step', () => {
			expect(calculateProgress('field_completion')).toBe(60)
		})

		it('should return correct progress percentage for review step', () => {
			expect(calculateProgress('review')).toBe(80)
		})

		it('should return correct progress percentage for submission step', () => {
			expect(calculateProgress('submission')).toBe(90)
		})

		it('should return 0 for unknown steps', () => {
			expect(calculateProgress('unknown_step')).toBe(0)
			expect(calculateProgress('')).toBe(0)
		})
	})

	describe('calculateStepCompletion', () => {
		it('should report project selection step as complete when projectKey is present', () => {
			const state: WizardState = {
				active: true,
				currentStep: WizardStep.PROJECT_SELECTION,
				projectKey: 'TEST',
				timestamp: Date.now(),
				validation: { errors: {}, warnings: {} },
				fields: {},
			}

			const result = calculateStepCompletion(state)
			expect(result.complete).toBe(true)
			expect(result.requiredFields).toEqual([])
		})

		it('should report project selection step as incomplete when projectKey is missing', () => {
			const state: WizardState = {
				active: true,
				currentStep: WizardStep.PROJECT_SELECTION,
				timestamp: Date.now(),
				validation: { errors: {}, warnings: {} },
				fields: {},
			}

			const result = calculateStepCompletion(state)
			expect(result.complete).toBe(false)
			expect(result.requiredFields).toEqual(['projectKey'])
		})

		it('should report issue type selection step as complete when issueTypeId is present', () => {
			const state: WizardState = {
				active: true,
				currentStep: WizardStep.ISSUE_TYPE_SELECTION,
				projectKey: 'TEST',
				issueTypeId: '10001',
				timestamp: Date.now(),
				validation: { errors: {}, warnings: {} },
				fields: {},
			}

			const result = calculateStepCompletion(state)
			expect(result.complete).toBe(true)
			expect(result.requiredFields).toEqual([])
		})

		it('should report issue type selection step as incomplete when issueTypeId is missing', () => {
			const state: WizardState = {
				active: true,
				currentStep: WizardStep.ISSUE_TYPE_SELECTION,
				projectKey: 'TEST',
				timestamp: Date.now(),
				validation: { errors: {}, warnings: {} },
				fields: {},
			}

			const result = calculateStepCompletion(state)
			expect(result.complete).toBe(false)
			expect(result.requiredFields).toEqual(['issueTypeId'])
		})

		it('should report field completion step as complete when fields are present', () => {
			const state: WizardState = {
				active: true,
				currentStep: WizardStep.FIELD_COMPLETION,
				projectKey: 'TEST',
				issueTypeId: '10001',
				fields: { summary: 'Test issue' },
				timestamp: Date.now(),
				validation: { errors: {}, warnings: {} },
			}

			const result = calculateStepCompletion(state)
			expect(result.complete).toBe(true)
			expect(result.requiredFields).toEqual([])
		})

		it('should report field completion step as incomplete when fields are missing', () => {
			const state: WizardState = {
				active: true,
				currentStep: WizardStep.FIELD_COMPLETION,
				projectKey: 'TEST',
				issueTypeId: '10001',
				timestamp: Date.now(),
				validation: { errors: {}, warnings: {} },
				fields: {},
			}

			const result = calculateStepCompletion(state)
			expect(result.complete).toBe(false)
			expect(result.requiredFields).toEqual(['summary'])
		})

		it('should report field completion step as incomplete when fields object is empty', () => {
			const state: WizardState = {
				active: true,
				currentStep: WizardStep.FIELD_COMPLETION,
				projectKey: 'TEST',
				issueTypeId: '10001',
				fields: {},
				timestamp: Date.now(),
				validation: { errors: {}, warnings: {} },
			}

			const result = calculateStepCompletion(state)
			expect(result.complete).toBe(false)
			expect(result.requiredFields).toEqual(['summary'])
		})

		it('should return complete for initiate step', () => {
			const state: WizardState = {
				active: true,
				currentStep: WizardStep.INITIATE,
				timestamp: Date.now(),
				validation: { errors: {}, warnings: {} },
				fields: {},
			}

			const result = calculateStepCompletion(state)
			expect(result.complete).toBe(true)
			expect(result.requiredFields).toBeUndefined()
		})

		it('should return complete for review step', () => {
			const state: WizardState = {
				active: true,
				currentStep: WizardStep.REVIEW,
				projectKey: 'TEST',
				issueTypeId: '10001',
				fields: { summary: 'Test issue' },
				timestamp: Date.now(),
				validation: { errors: {}, warnings: {} },
			}

			const result = calculateStepCompletion(state)
			expect(result.complete).toBe(true)
			expect(result.requiredFields).toBeUndefined()
		})

		it('should return complete for submission step', () => {
			const state: WizardState = {
				active: true,
				currentStep: WizardStep.SUBMISSION,
				projectKey: 'TEST',
				issueTypeId: '10001',
				fields: { summary: 'Test issue' },
				timestamp: Date.now(),
				validation: { errors: {}, warnings: {} },
			}

			const result = calculateStepCompletion(state)
			expect(result.complete).toBe(true)
			expect(result.requiredFields).toBeUndefined()
		})
	})
})
