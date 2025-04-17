import { updateWizardState } from '../updateWizardState'
import { transitionState } from '../../stateMachine'
import { validateStateTransition } from '../../stateValidators'
import { log } from '../../../../utils/logger'
import { createError, createSuccess } from '../../../../errors/types'
import type { WizardState, WizardStep } from '../../types'

jest.mock('../../stateMachine')
jest.mock('../../stateValidators')
jest.mock('../../../../utils/logger')

const BASE_PROJECT_KEY = 'PROJ'
const BASE_ISSUE_TYPE_ID = '10001'
const BASE_TIMESTAMP = 1678886400000
const BASE_FLOW_ID = 'test-flow'
const BASE_FIELDS = { summary: 'Initial', description: 'Initial' }

const baseState: WizardState = {
	currentStep: 'selectProject',
	projectKey: BASE_PROJECT_KEY,
	issueTypeId: BASE_ISSUE_TYPE_ID,
	fields: { ...BASE_FIELDS },
	timestamp: BASE_TIMESTAMP,
	flowId: BASE_FLOW_ID,
} as unknown as WizardState

describe('updateWizardState', () => {
	const mockedTransitionState = jest.mocked(transitionState)
	const mockedValidateStateTransition = jest.mocked(validateStateTransition)
	const mockedLog = jest.mocked(log)

	beforeEach(() => {
		jest.useFakeTimers().setSystemTime(BASE_TIMESTAMP)
		mockedTransitionState.mockReset()
		mockedValidateStateTransition.mockReset()
		mockedLog.mockReset()
		mockedValidateStateTransition.mockReturnValue(createSuccess(true))
		mockedTransitionState.mockImplementation((s, step) =>
			createSuccess({ ...s, currentStep: step, timestamp: BASE_TIMESTAMP }),
		)
	})

	afterEach(() => {
		jest.useRealTimers()
	})

	test('updates state without step change (validation path)', () => {
		const partial = { fields: { summary: 'Updated' } }
		const result = updateWizardState(baseState, partial)
		expect(result.success).toBe(true)
		expect(result.success && result.data.fields.summary).toBe('Updated')
		expect(mockedValidateStateTransition).toHaveBeenCalled()
		expect(mockedTransitionState).not.toHaveBeenCalled()
	})

	test('updates state with step change (transition path)', () => {
		const step: WizardStep = 'selectIssueType' as WizardStep
		const partial = { currentStep: step }
		const result = updateWizardState(baseState, partial)
		expect(result.success).toBe(true)
		expect(result.success && result.data.currentStep).toBe(step)
		expect(mockedTransitionState).toHaveBeenCalled()
		expect(mockedValidateStateTransition).not.toHaveBeenCalled()
	})

	test('returns error if step transition fails', () => {
		mockedTransitionState.mockReturnValue(createError('fail', 'ERR'))
		const partial = { currentStep: 'selectIssueType' as WizardStep }
		const result = updateWizardState(baseState, partial)
		expect(result.success).toBe(false)
	})

	test('returns error if validation fails', () => {
		mockedValidateStateTransition.mockReturnValue(createError('fail', 'ERR'))
		const partial = { fields: { summary: '' } }
		const result = updateWizardState(baseState, partial)
		expect(result.success).toBe(false)
	})

	test('merges fields (existing, new, overwrite)', () => {
		const partial = { fields: { description: 'New', priority: 'High' } }
		const result = updateWizardState(baseState, partial)
		expect(result.success && result.data.fields.description).toBe('New')
		expect(result.success && (result.data.fields as any).priority).toBe('High')
		expect(result.success && result.data.fields.summary).toBe('Initial')
	})

	test('explicitly updates projectKey', () => {
		const partial = { projectKey: 'NEWPROJ' }
		const result = updateWizardState(baseState, partial)
		expect(result.success && result.data.projectKey).toBe('NEWPROJ')
	})

	test('explicitly updates issueTypeId', () => {
		const partial = { issueTypeId: '20002' }
		const result = updateWizardState(baseState, partial)
		expect(result.success && result.data.issueTypeId).toBe('20002')
	})

	test('returns new state object (immutability)', () => {
		const partial = { fields: { summary: 'Immutable' } }
		const result = updateWizardState(baseState, partial)
		expect(result.success && result.data).not.toBe(baseState)
		expect(result.success && result.data.fields).not.toBe(baseState.fields)
	})

	test('logs debug messages', () => {
		updateWizardState(baseState, { fields: { summary: 'Log' } })
		expect(mockedLog).toHaveBeenCalledWith(expect.stringContaining('Current state before update:'))
		expect(mockedLog).toHaveBeenCalledWith(expect.stringContaining('Partial state to apply:'))
		expect(mockedLog).toHaveBeenCalledWith(expect.stringContaining('Final updated state:'))
		expect(mockedLog).toHaveBeenCalledWith(expect.stringContaining('Updated wizard state to step:'))
	})
})
