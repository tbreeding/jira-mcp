/**
 * Unit tests for the Issue Creation Wizard State Validators
 */

import { validateStateTransition } from '../stateValidators'
import { WizardStep } from '../types'
import type { WizardState } from '../types'

describe('State Validators', () => {
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

	it('should allow moving to the next step', () => {
		const result = validateStateTransition(baseState, {
			currentStep: WizardStep.PROJECT_SELECTION,
		})

		expect(result.success).toBe(true)
	})

	it('should allow updating fields without changing steps', () => {
		const result = validateStateTransition(baseState, {
			fields: {
				summary: 'Test summary',
			},
		})

		expect(result.success).toBe(true)
	})

	it('should not allow skipping steps', () => {
		const result = validateStateTransition(baseState, {
			currentStep: WizardStep.ISSUE_TYPE_SELECTION,
		})

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('INVALID_PARAMETERS')
		}
	})

	it('should allow moving to previous steps', () => {
		const stateWithProject: WizardState = {
			...baseState,
			currentStep: WizardStep.PROJECT_SELECTION,
			projectKey: 'TEST-1',
		}

		const result = validateStateTransition(stateWithProject, {
			currentStep: WizardStep.INITIATE,
		})

		expect(result.success).toBe(true)
	})

	it('should require project key for issue type selection', () => {
		const stateWithoutProject: WizardState = {
			...baseState,
			currentStep: WizardStep.PROJECT_SELECTION,
		}

		const result = validateStateTransition(stateWithoutProject, {
			currentStep: WizardStep.ISSUE_TYPE_SELECTION,
		})

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('INVALID_PARAMETERS')
		}
	})

	it('should allow issue type selection when project is selected', () => {
		const stateWithProject: WizardState = {
			...baseState,
			currentStep: WizardStep.PROJECT_SELECTION,
			projectKey: 'TEST-1',
		}

		const result = validateStateTransition(stateWithProject, {
			currentStep: WizardStep.ISSUE_TYPE_SELECTION,
		})

		expect(result.success).toBe(true)
	})

	it('should require issue type for field completion step', () => {
		const stateWithProject: WizardState = {
			...baseState,
			currentStep: WizardStep.ISSUE_TYPE_SELECTION,
			projectKey: 'TEST-1',
		}

		const result = validateStateTransition(stateWithProject, {
			currentStep: WizardStep.FIELD_COMPLETION,
		})

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('INVALID_PARAMETERS')
		}
	})

	it('should allow field completion when issue type is selected', () => {
		const stateWithIssueType: WizardState = {
			...baseState,
			currentStep: WizardStep.ISSUE_TYPE_SELECTION,
			projectKey: 'TEST-1',
			issueTypeId: '10000',
		}

		const result = validateStateTransition(stateWithIssueType, {
			currentStep: WizardStep.FIELD_COMPLETION,
		})

		expect(result.success).toBe(true)
	})

	it('should always allow transition from INITIATE to PROJECT_SELECTION regardless of validation', () => {
		// Start with a state that might otherwise fail validation
		const initState: WizardState = {
			...baseState,
			currentStep: WizardStep.INITIATE,
			// Intentionally missing projectKey
		}

		const result = validateStateTransition(initState, {
			currentStep: WizardStep.PROJECT_SELECTION,
		})

		// This transition should always succeed due to special case handling
		expect(result.success).toBe(true)
	})
})
