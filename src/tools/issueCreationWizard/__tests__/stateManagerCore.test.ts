/**
 * Unit tests for the Issue Creation Wizard State Manager Core
 */

import { StateManagerCore } from '../stateManagerCore'
import { WizardStep } from '../types'
import type { WizardState } from '../types'

// Mock uuid module
jest.mock('uuid', () => ({
	v4: jest.fn().mockReturnValue('test-uuid-1234'),
}))

// Mock the logger
jest.mock('../../../utils/logger', () => ({
	log: jest.fn(),
}))

describe('StateManagerCore', () => {
	// Sample state for testing
	const sampleState: WizardState = {
		active: true,
		currentStep: WizardStep.INITIATE,
		fields: {},
		validation: {
			errors: {},
			warnings: {},
		},
		timestamp: 1648000000000, // Fixed timestamp for testing
	}

	beforeEach(() => {
		// Reset all mocks before each test
		jest.clearAllMocks()
	})

	it('should initialize with a unique instance ID', () => {
		const stateManagerCore = new StateManagerCore()
		// We're checking internal properties, but this is for testing only
		expect((stateManagerCore as any).instanceId).toBe('test-uuid-1234')
	})

	it('should return null when no state is set', () => {
		const stateManagerCore = new StateManagerCore()
		const state = stateManagerCore.getStateValue()
		expect(state).toBeNull()
	})

	it('should set and get state value correctly', () => {
		const stateManagerCore = new StateManagerCore()

		// Set the state
		stateManagerCore.setStateValue(sampleState)

		// Get the state and verify
		const retrievedState = stateManagerCore.getStateValue()
		expect(retrievedState).toEqual(sampleState)
	})

	it('should create a deep copy when setting state to avoid reference issues', () => {
		const stateManagerCore = new StateManagerCore()

		// Set the state
		stateManagerCore.setStateValue(sampleState)

		// Get the state
		const retrievedState = stateManagerCore.getStateValue()

		// Modify the original state
		const modifiedState = { ...sampleState, active: false }

		// Original state shouldn't have changed
		expect(retrievedState).toEqual(sampleState)
		expect(retrievedState).not.toEqual(modifiedState)

		// And should be a deep copy, not the same reference
		expect(retrievedState).not.toBe(sampleState)
	})

	it('should handle setting state to null', () => {
		const stateManagerCore = new StateManagerCore()

		// First set a state
		stateManagerCore.setStateValue(sampleState)
		expect(stateManagerCore.getStateValue()).toEqual(sampleState)

		// Then set to null
		stateManagerCore.setStateValue(null)
		expect(stateManagerCore.getStateValue()).toBeNull()
	})

	it('should update state with new values', () => {
		const stateManagerCore = new StateManagerCore()

		// Set initial state
		stateManagerCore.setStateValue(sampleState)

		// Update to a new state
		const updatedState = {
			...sampleState,
			currentStep: WizardStep.PROJECT_SELECTION,
		}
		stateManagerCore.setStateValue(updatedState)

		// Get the state and verify
		const retrievedState = stateManagerCore.getStateValue()
		expect(retrievedState).toEqual(updatedState)
		expect(retrievedState?.currentStep).toBe(WizardStep.PROJECT_SELECTION)
	})

	it('should log a warning when step does not change', () => {
		const stateManagerCore = new StateManagerCore()
		const logger = require('../../../utils/logger')

		// Set initial state with a non-initiate step
		const initialState = {
			...sampleState,
			currentStep: WizardStep.PROJECT_SELECTION,
		}
		stateManagerCore.setStateValue(initialState)

		// Update with the same step
		const updatedState = {
			...sampleState,
			currentStep: WizardStep.PROJECT_SELECTION,
		}
		stateManagerCore.setStateValue(updatedState)

		// Verify logger was called with warning
		expect(logger.log).toHaveBeenCalledWith(
			expect.stringContaining(`WARNING: Step did not change from ${WizardStep.PROJECT_SELECTION}`),
		)
	})

	it('should not throw errors when handling state operations', () => {
		const stateManagerCore = new StateManagerCore()

		// These operations should not throw exceptions
		expect(() => {
			stateManagerCore.setStateValue(sampleState)
		}).not.toThrow()

		expect(() => {
			stateManagerCore.getStateValue()
		}).not.toThrow()

		expect(() => {
			stateManagerCore.setStateValue(null)
		}).not.toThrow()
	})
})
