import { updateWizardState } from '../updateWizardState'
import { transitionState } from '../../stateMachine'
import { validateStateTransition } from '../../stateValidators'
import { log } from '../../../../utils/logger'
import type { WizardState, WizardStep } from '../../types'
import { createError, createSuccess } from '../../../../errors/types'

// Mock dependencies
jest.mock('../../stateMachine')
jest.mock('../../stateValidators')
jest.mock('../../../../utils/logger')

const mockedTransitionState = jest.mocked(transitionState)
const mockedValidateStateTransition = jest.mocked(validateStateTransition)
const mockedLog = jest.mocked(log)

describe('updateWizardState', function () {
	let baseState: WizardState
	const mockTimestamp = 1678886400000 // March 15, 2023

	beforeAll(function () {
		jest.useFakeTimers()
		jest.setSystemTime(new Date(mockTimestamp))
	})

	afterAll(function () {
		jest.useRealTimers()
	})

	beforeEach(function () {
		// Reset mocks before each test
		mockedTransitionState.mockClear()
		mockedValidateStateTransition.mockClear()
		mockedLog.mockClear()

		// Define a base state for tests
		baseState = {
			currentStep: 'selectProject',
			projectKey: 'PROJ',
			issueTypeId: '10001',
			fields: {
				summary: 'Initial Summary',
				description: 'Initial Description',
			},
			timestamp: mockTimestamp - 10000, // Set an earlier timestamp
			flowId: 'test-flow',
		} as unknown as WizardState

		// Default mock implementations
		mockedValidateStateTransition.mockReturnValue(createSuccess(true))
		mockedTransitionState.mockImplementation(function (state: WizardState) {
			// Default successful transition mock
			return createSuccess({ ...state, timestamp: Date.now() })
		})
	})

	test('should update state without step change and call validator', function () {
		const partialState: Partial<WizardState> = {
			fields: { summary: 'Updated Summary' },
		}
		const result = updateWizardState(baseState, partialState)

		expect(mockedValidateStateTransition).toHaveBeenCalledWith(baseState, partialState)
		expect(mockedTransitionState).not.toHaveBeenCalled()
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.fields.summary).toBe('Updated Summary')
			// Check other fields remain
			expect(result.data.fields.description).toBe('Initial Description')
			expect(result.data.projectKey).toBe('PROJ')
			expect(result.data.timestamp).toBe(mockTimestamp)
		}
	})

	test('should merge fields correctly', function () {
		const partialState: Partial<WizardState> = {
			fields: { description: 'Updated Description', priority: 'High' },
		}
		const result = updateWizardState(baseState, partialState)

		expect(result.success).toBe(true)
		if (result.success) {
			// Existing field updated
			expect(result.data.fields.description).toBe('Updated Description')
			// Existing field kept
			expect(result.data.fields.summary).toBe('Initial Summary')
			// New field added
			expect((result.data.fields as any).priority).toBe('High')
		}
	})

	test('should handle step transition using state machine', function () {
		const targetStep: WizardStep = 'selectIssueType' as WizardStep
		const partialState: Partial<WizardState> = { currentStep: targetStep }
		const transitionedState: WizardState = {
			...baseState,
			currentStep: targetStep,
			timestamp: mockTimestamp,
		}

		mockedTransitionState.mockReturnValue(createSuccess(transitionedState))

		const result = updateWizardState(baseState, partialState)

		expect(mockedTransitionState).toHaveBeenCalledWith(baseState, targetStep)
		expect(mockedValidateStateTransition).not.toHaveBeenCalled()
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.currentStep).toBe(targetStep)
			expect(result.data.timestamp).toBe(mockTimestamp)
			// Other state properties should be from the *transitioned* state
			expect(result.data).toEqual(transitionedState)
		}
	})

	test('should return error if step transition fails', function () {
		const targetStep: WizardStep = 'selectIssueType' as WizardStep
		const partialState: Partial<WizardState> = { currentStep: targetStep }
		const error = createError('Transition Failed', 'INVALID_TRANSITION')

		mockedTransitionState.mockReturnValue(error)

		const result = updateWizardState(baseState, partialState)

		expect(mockedTransitionState).toHaveBeenCalledWith(baseState, targetStep)
		expect(mockedValidateStateTransition).not.toHaveBeenCalled()
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toEqual(error.error)
		}
	})

	test('should return error if non-step validation fails', function () {
		const partialState: Partial<WizardState> = {
			fields: { summary: '' }, // Assume empty summary is invalid
		}
		const error = createError('Validation Failed', 'INVALID_STATE')

		mockedValidateStateTransition.mockReturnValue(error)

		const result = updateWizardState(baseState, partialState)

		expect(mockedValidateStateTransition).toHaveBeenCalledWith(baseState, partialState)
		expect(mockedTransitionState).not.toHaveBeenCalled()
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toEqual(error.error)
		}
	})

	test('should explicitly update projectKey when provided', function () {
		const partialState: Partial<WizardState> = { projectKey: 'NEWPROJ' }
		const result = updateWizardState(baseState, partialState)

		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.projectKey).toBe('NEWPROJ')
			expect(result.data.timestamp).toBe(mockTimestamp)
		}
	})

	test('should explicitly update issueTypeId when provided', function () {
		const partialState: Partial<WizardState> = { issueTypeId: '20002' }
		const result = updateWizardState(baseState, partialState)

		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.issueTypeId).toBe('20002')
			expect(result.data.timestamp).toBe(mockTimestamp)
		}
	})

	test('should explicitly set projectKey from undefined when provided', function () {
		const stateWithoutProject: WizardState = { ...baseState, projectKey: undefined }
		const partialState: Partial<WizardState> = { projectKey: 'NEWPROJ' }
		const result = updateWizardState(stateWithoutProject, partialState)

		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.projectKey).toBe('NEWPROJ')
		}
	})

	test('should explicitly set issueTypeId from undefined when provided', function () {
		const stateWithoutIssueType: WizardState = { ...baseState, issueTypeId: undefined }
		const partialState: Partial<WizardState> = { issueTypeId: '20002' }
		const result = updateWizardState(stateWithoutIssueType, partialState)

		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.issueTypeId).toBe('20002')
		}
	})

	test('should return a new state object (immutability)', function () {
		const partialState: Partial<WizardState> = {
			fields: { summary: 'Immutable Check' },
		}
		const result = updateWizardState(baseState, partialState)

		expect(result.success).toBe(true)
		if (result.success) {
			// Check if the returned object is different from the original
			expect(result.data).not.toBe(baseState)
			// Check if nested objects are also new
			expect(result.data.fields).not.toBe(baseState.fields)
			// Verify content
			expect(result.data.fields.summary).toBe('Immutable Check')
			// Ensure original state was not mutated
			expect(baseState.fields.summary).toBe('Initial Summary')
		}
	})

	test('should log debug messages', function () {
		const partialState: Partial<WizardState> = {
			fields: { summary: 'Logging Test' },
		}
		updateWizardState(baseState, partialState)

		expect(mockedLog).toHaveBeenCalledWith(expect.stringContaining('Current state before update:'))
		expect(mockedLog).toHaveBeenCalledWith(expect.stringContaining('Partial state to apply:'))
		expect(mockedLog).toHaveBeenCalledWith(expect.stringContaining('Final updated state:'))
		expect(mockedLog).toHaveBeenCalledWith(expect.stringContaining('Updated wizard state to step:'))
	})

	test('should update fields during a successful step transition', function () {
		const targetStep: WizardStep = 'selectIssueType' as WizardStep
		const partialState: Partial<WizardState> = {
			currentStep: targetStep,
			fields: { summary: 'Updated During Transition' },
			projectKey: 'TRANSITIONPROJ', // Also update other fields
		}

		// Mock transition to return a state based on the *original* state but with the new step
		const transitionedStateBase: WizardState = {
			...baseState,
			currentStep: targetStep,
			timestamp: mockTimestamp,
		}
		mockedTransitionState.mockReturnValue(createSuccess(transitionedStateBase))

		const result = updateWizardState(baseState, partialState)

		expect(mockedTransitionState).toHaveBeenCalledWith(baseState, targetStep)
		expect(result.success).toBe(true)
		if (result.success) {
			// Base state for update should be the *result* of the transition
			expect(result.data.currentStep).toBe(targetStep)
			// Fields should be merged: original + partial
			expect(result.data.fields.summary).toBe('Updated During Transition')
			expect(result.data.fields.description).toBe('Initial Description')
			// Other properties explicitly set in partialState should override the transitioned state
			expect(result.data.projectKey).toBe('TRANSITIONPROJ')
			// Properties *not* in partialState should come from the transitioned state
			expect(result.data.issueTypeId).toBe(baseState.issueTypeId) // From transitionedStateBase
			expect(result.data.timestamp).toBe(mockTimestamp) // Updated during the update process itself
		}
	})
})
