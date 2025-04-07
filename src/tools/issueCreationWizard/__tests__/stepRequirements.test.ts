import { checkStepRequirements, getMissingRequirements } from '../stepRequirements'
import { WizardStep } from '../types'
import type { WizardState } from '../types'

// Mock the logger to prevent actual logging during tests
jest.mock('../../../utils/logger', function () {
	return {
		log: jest.fn(),
	}
})

describe('checkStepRequirements', function () {
	const baseState = {
		currentStep: WizardStep.INITIATE,
		projectKey: '',
		issueTypeId: '',
		fields: {},
		validation: { errors: {}, warnings: {} },
		isLoading: false,
		error: null,
		issueResult: null,
	} as unknown as WizardState

	test('should return true for INITIATE step', function () {
		expect(checkStepRequirements(baseState, WizardStep.INITIATE)).toBe(true)
	})

	test('should return false for PROJECT_SELECTION when projectKey is missing', function () {
		expect(checkStepRequirements(baseState, WizardStep.PROJECT_SELECTION)).toBe(false)
	})

	test('should return true for PROJECT_SELECTION when projectKey is present', function () {
		const state = { ...baseState, projectKey: 'PROJ' }
		expect(checkStepRequirements(state, WizardStep.PROJECT_SELECTION)).toBe(true)
	})

	test('should return false for ISSUE_TYPE_SELECTION when issueTypeId is missing', function () {
		const state = { ...baseState, projectKey: 'PROJ' }
		expect(checkStepRequirements(state, WizardStep.ISSUE_TYPE_SELECTION)).toBe(false)
	})

	test('should return true for ISSUE_TYPE_SELECTION when projectKey and issueTypeId are present', function () {
		const state = { ...baseState, projectKey: 'PROJ', issueTypeId: '10001' }
		expect(checkStepRequirements(state, WizardStep.ISSUE_TYPE_SELECTION)).toBe(true)
	})

	test('should return false for FIELD_COMPLETION when fields are empty', function () {
		const state = { ...baseState, projectKey: 'PROJ', issueTypeId: '10001' }
		expect(checkStepRequirements(state, WizardStep.FIELD_COMPLETION)).toBe(false)
	})

	test('should return false for FIELD_COMPLETION when validation errors exist', function () {
		const state = {
			...baseState,
			projectKey: 'PROJ',
			issueTypeId: '10001',
			fields: { summary: 'Test' },
			validation: { errors: { summary: ['Summary too short'] }, warnings: {} },
		} as unknown as WizardState
		expect(checkStepRequirements(state, WizardStep.FIELD_COMPLETION)).toBe(false)
	})

	test('should return true for FIELD_COMPLETION when required fields are present and no errors', function () {
		const state = {
			...baseState,
			projectKey: 'PROJ',
			issueTypeId: '10001',
			fields: { summary: 'Test Summary', description: 'Test Desc' },
			validation: { errors: {}, warnings: {} },
		} as unknown as WizardState
		expect(checkStepRequirements(state, WizardStep.FIELD_COMPLETION)).toBe(true)
	})

	test('should return true for REVIEW when requirements are met', function () {
		const state = {
			...baseState,
			projectKey: 'PROJ',
			issueTypeId: '10001',
			fields: { summary: 'Test Summary' },
			validation: { errors: {}, warnings: {} },
		} as unknown as WizardState
		expect(checkStepRequirements(state, WizardStep.REVIEW)).toBe(true)
	})

	test('should return true for SUBMISSION when requirements are met', function () {
		const state = {
			...baseState,
			projectKey: 'PROJ',
			issueTypeId: '10001',
			fields: { summary: 'Test Summary' },
			validation: { errors: {}, warnings: {} },
		} as unknown as WizardState
		expect(checkStepRequirements(state, WizardStep.SUBMISSION)).toBe(true)
	})

	// Test unknown step - though TypeScript should prevent this, defensively test
	test('should return false for an unknown step', function () {
		// @ts-expect-error Testing invalid step
		expect(checkStepRequirements(baseState, 'UNKNOWN_STEP')).toBe(false)

		const { log } = require('../../../utils/logger')
		expect(log).toHaveBeenCalledWith('ERROR: No requirements defined for step UNKNOWN_STEP')
	})
})

describe('getMissingRequirements', function () {
	const baseState = {
		currentStep: WizardStep.INITIATE,
		projectKey: '',
		issueTypeId: '',
		fields: {},
		validation: { errors: {}, warnings: {} },
		isLoading: false,
		error: null,
		issueResult: null,
	} as unknown as WizardState

	test('should return empty array for INITIATE step', function () {
		expect(getMissingRequirements(baseState, WizardStep.INITIATE)).toEqual([])
	})

	test('should return missing project for PROJECT_SELECTION step', function () {
		expect(getMissingRequirements(baseState, WizardStep.PROJECT_SELECTION)).toEqual(['Project selection'])
	})

	test('should return empty array for PROJECT_SELECTION step when project is selected', function () {
		const state = { ...baseState, projectKey: 'PROJ' }
		expect(getMissingRequirements(state, WizardStep.PROJECT_SELECTION)).toEqual([])
	})

	test('should return missing project and issue type for ISSUE_TYPE_SELECTION step', function () {
		expect(getMissingRequirements(baseState, WizardStep.ISSUE_TYPE_SELECTION)).toEqual([
			'Project selection',
			'Issue type selection',
		])
	})

	test('should return missing issue type for ISSUE_TYPE_SELECTION step when project is selected', function () {
		const state = { ...baseState, projectKey: 'PROJ' }
		expect(getMissingRequirements(state, WizardStep.ISSUE_TYPE_SELECTION)).toEqual(['Issue type selection'])
	})

	test('should return empty array for ISSUE_TYPE_SELECTION step when project and issue type are selected', function () {
		const state = { ...baseState, projectKey: 'PROJ', issueTypeId: '10001' }
		expect(getMissingRequirements(state, WizardStep.ISSUE_TYPE_SELECTION)).toEqual([])
	})

	test('should return all missing for FIELD_COMPLETION step with initial state', function () {
		expect(getMissingRequirements(baseState, WizardStep.FIELD_COMPLETION)).toEqual([
			'Project selection',
			'Issue type selection',
			'Required fields',
		])
	})

	test('should return missing fields for FIELD_COMPLETION step when project and type selected', function () {
		const state = { ...baseState, projectKey: 'PROJ', issueTypeId: '10001' }
		expect(getMissingRequirements(state, WizardStep.FIELD_COMPLETION)).toEqual(['Required fields'])
	})

	test('should return missing validation for FIELD_COMPLETION step when fields present but errors exist', function () {
		const state = {
			...baseState,
			projectKey: 'PROJ',
			issueTypeId: '10001',
			fields: { summary: 'Test' },
			validation: { errors: { summary: ['Too short'] }, warnings: {} },
		} as unknown as WizardState
		expect(getMissingRequirements(state, WizardStep.FIELD_COMPLETION)).toEqual([
			'Valid field values (validation errors exist)',
		])
	})

	test('should return empty array for FIELD_COMPLETION step when all requirements met', function () {
		const state = {
			...baseState,
			projectKey: 'PROJ',
			issueTypeId: '10001',
			fields: { summary: 'Test Summary' },
			validation: { errors: {}, warnings: {} },
		} as unknown as WizardState
		expect(getMissingRequirements(state, WizardStep.FIELD_COMPLETION)).toEqual([])
	})

	test('should return same missing requirements for REVIEW as for FIELD_COMPLETION', function () {
		const state = {
			...baseState,
			projectKey: 'PROJ',
			issueTypeId: '10001',
			fields: { summary: 'Test' },
			validation: { errors: { summary: ['Too short'] }, warnings: {} },
		} as unknown as WizardState
		expect(getMissingRequirements(state, WizardStep.REVIEW)).toEqual(
			getMissingRequirements(state, WizardStep.FIELD_COMPLETION),
		)
	})

	test('should return same missing requirements for SUBMISSION as for FIELD_COMPLETION', function () {
		const state = {
			...baseState,
			projectKey: 'PROJ',
			issueTypeId: '10001',
			fields: { summary: 'Test' },
			validation: { errors: { summary: ['Too short'] }, warnings: {} },
		} as unknown as WizardState
		expect(getMissingRequirements(state, WizardStep.SUBMISSION)).toEqual(
			getMissingRequirements(state, WizardStep.FIELD_COMPLETION),
		)
	})

	// Test unknown step
	test('should return unknown step message for an unknown step', function () {
		// @ts-expect-error Testing invalid step
		expect(getMissingRequirements(baseState, 'UNKNOWN_STEP')).toEqual(['Unknown step'])

		const { log } = require('../../../utils/logger')
		expect(log).toHaveBeenCalledWith('ERROR: No requirements defined for step UNKNOWN_STEP')
	})
})
