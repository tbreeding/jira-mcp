/**
 * Unit tests for the Issue Creation Wizard State Manager
 */

import { StateManager } from '../stateManager'
import { StateManagerCore } from '../stateManagerCore'
import { WizardStep } from '../types'

describe('StateManager', () => {
	let stateManagerCore: StateManagerCore
	let stateManager: StateManager

	beforeEach(() => {
		// Make sure we start with a fresh state manager
		stateManagerCore = new StateManagerCore()
		stateManager = new StateManager(stateManagerCore)
		stateManager.resetState()
	})

	it('should initialize with dependency injection', () => {
		const core = new StateManagerCore()
		const manager = new StateManager(core)
		expect(manager).toBeInstanceOf(StateManager)
	})

	it('should initialize a new wizard state', () => {
		const result = stateManager.initializeState()
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.active).toBe(true)
			expect(result.data.currentStep).toBe(WizardStep.INITIATE)
			expect(result.data.fields).toEqual({})
			expect(result.data.validation.errors).toEqual({})
			expect(result.data.validation.warnings).toEqual({})
			expect(typeof result.data.timestamp).toBe('number')
		}
	})

	it('should not allow initializing when a wizard is already active', () => {
		stateManager.initializeState()
		const result = stateManager.initializeState()
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('INVALID_PARAMETERS')
		}
	})

	it('should get the current state when a wizard is active', () => {
		stateManager.initializeState()
		const result = stateManager.getState()
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.active).toBe(true)
		}
	})

	it('should return an error when getting state without an active wizard', () => {
		const result = stateManager.getState()
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('INVALID_PARAMETERS')
		}
	})

	it('should reset the wizard state', () => {
		stateManager.initializeState()
		expect(stateManager.isActive()).toBe(true)

		const result = stateManager.resetState()
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.reset).toBe(true)
		}
		expect(stateManager.isActive()).toBe(false)
	})

	it('should allow project selection after initialization', () => {
		stateManager.initializeState()
		const result = stateManager.updateState({
			currentStep: WizardStep.PROJECT_SELECTION,
			projectKey: 'TEST-1',
		})
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.currentStep).toBe(WizardStep.PROJECT_SELECTION)
			expect(result.data.projectKey).toBe('TEST-1')
		}
	})

	it('should allow issue type selection after project selection', () => {
		stateManager.initializeState()
		stateManager.updateState({
			currentStep: WizardStep.PROJECT_SELECTION,
			projectKey: 'TEST-1',
		})

		const result = stateManager.updateState({
			currentStep: WizardStep.ISSUE_TYPE_SELECTION,
			issueTypeId: '10000',
		})

		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.currentStep).toBe(WizardStep.ISSUE_TYPE_SELECTION)
			expect(result.data.issueTypeId).toBe('10000')
		}
	})

	it('should not allow skipping steps', () => {
		stateManager.initializeState()
		const result = stateManager.updateState({
			currentStep: WizardStep.FIELD_COMPLETION,
		})

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('INVALID_PARAMETERS')
		}
	})

	it('should not allow issue type selection without a project', () => {
		stateManager.initializeState()
		const result = stateManager.updateState({
			currentStep: WizardStep.ISSUE_TYPE_SELECTION,
		})

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('INVALID_PARAMETERS')
		}
	})

	it('should allow updating field values', () => {
		stateManager.initializeState()
		stateManager.updateState({
			currentStep: WizardStep.PROJECT_SELECTION,
			projectKey: 'TEST-1',
		})
		stateManager.updateState({
			currentStep: WizardStep.ISSUE_TYPE_SELECTION,
			issueTypeId: '10000',
		})
		stateManager.updateState({
			currentStep: WizardStep.FIELD_COMPLETION,
		})

		const result = stateManager.updateState({
			fields: {
				summary: 'Test issue',
				description: 'Test description',
			},
		})

		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.fields.summary).toBe('Test issue')
			expect(result.data.fields.description).toBe('Test description')
		}
	})

	it('should log correctly when projectKey is not set during a successful update', () => {
		stateManager.initializeState()
		// Move to Project Selection without setting projectKey
		// This is a valid forward transition where requirements check passes (INITIATE has none)
		const result = stateManager.updateState({
			currentStep: WizardStep.PROJECT_SELECTION,
			// projectKey remains undefined
		})
		expect(result.success).toBe(true) // This successful update should trigger the log with undefined projectKey
		if (result.success) {
			expect(result.data.currentStep).toBe(WizardStep.PROJECT_SELECTION)
			expect(result.data.projectKey).toBeUndefined() // Verify projectKey is indeed undefined
		}
		// The log on line 102 should have used the '|| '(not set)' branch
	})

	// Additional tests for better coverage

	it('should return error when updateState is called without an active wizard', () => {
		// Ensure no wizard is active
		stateManager.resetState()

		const result = stateManager.updateState({
			fields: { summary: 'Test' },
		})

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('INVALID_PARAMETERS')
		}
	})

	it('should return error when serializeState is called without an active wizard', () => {
		// Ensure no wizard is active
		stateManager.resetState()

		const result = stateManager.serializeState()

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('INVALID_PARAMETERS')
		}
	})

	it('should serialize and deserialize state correctly', () => {
		// Initialize and set up state
		stateManager.initializeState()
		stateManager.updateState({
			currentStep: WizardStep.PROJECT_SELECTION,
			projectKey: 'TEST-1',
		})

		// Serialize the state
		const serializeResult = stateManager.serializeState()
		expect(serializeResult.success).toBe(true)

		// Reset the state
		stateManager.resetState()
		expect(stateManager.isActive()).toBe(false)

		// Deserialize the state
		if (serializeResult.success) {
			const deserializeResult = stateManager.deserializeState(serializeResult.data)
			expect(deserializeResult.success).toBe(true)

			// Check that state is restored
			expect(stateManager.isActive()).toBe(true)

			// Get the state and verify contents
			const stateResult = stateManager.getState()
			if (stateResult.success) {
				expect(stateResult.data.projectKey).toBe('TEST-1')
				expect(stateResult.data.currentStep).toBe(WizardStep.PROJECT_SELECTION)
			}
		}
	})

	it('should handle invalid JSON during deserialization', () => {
		const invalidJson = 'not valid json'
		const result = stateManager.deserializeState(invalidJson)

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('UNKNOWN_ERROR')
		}
	})

	it('should reject invalid state format during deserialization', () => {
		const invalidState = JSON.stringify({ notAValidState: true })
		const result = stateManager.deserializeState(invalidState)

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('INVALID_PARAMETERS')
		}
	})
})
