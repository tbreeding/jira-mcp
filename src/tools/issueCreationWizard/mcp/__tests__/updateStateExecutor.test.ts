import { WizardStep } from '../../types'
import { updateStateWizardToolExecutor } from '../updateStateExecutor'
import type { StateManager } from '../../stateManager'
// Use a local type alias for JiraApiConfig to avoid import error

interface JiraApiConfig {
	baseUrl: string
	username: string
	apiToken: string
}

jest.mock('../buildPartialState', () => ({ buildPartialState: jest.fn(() => ({ mock: 'partial' })) }))
jest.mock('../utils', () => ({
	createSuccessResult: jest.fn((data) => ({ content: [{ type: 'text', text: JSON.stringify(data) }] })),
	createErrorResult: jest.fn((msg) => ({ content: [{ type: 'text', text: `Error: ${msg}` }], isError: true })),
}))
jest.mock('../validateStep', () => ({ validateStep: jest.fn(() => null) }))
jest.mock('../validateProjectKey', () => ({ validateProjectKey: jest.fn(() => Promise.resolve(null)) }))
jest.mock('../validateIssueTypeId', () => ({ validateIssueTypeId: jest.fn(() => Promise.resolve(null)) }))
jest.mock('../verifyStateUpdate', () => ({ verifyStateUpdate: jest.fn(() => null) }))
jest.mock('../../../../utils/logger', () => ({ log: jest.fn() }))

const { createSuccessResult, createErrorResult } = require('../utils')
const { validateStep } = require('../validateStep')
const { validateProjectKey } = require('../validateProjectKey')
const { validateIssueTypeId } = require('../validateIssueTypeId')
const { verifyStateUpdate } = require('../verifyStateUpdate')

const baseState = {
	active: true,
	currentStep: WizardStep.PROJECT_SELECTION,
	projectKey: 'PROJ',
	issueTypeId: '10001',
	fields: {},
	validation: { errors: {}, warnings: {} },
	timestamp: 1,
}

describe('updateStateWizardToolExecutor', () => {
	let mockStateManager: jest.Mocked<StateManager>
	let mockConfig: JiraApiConfig

	beforeEach(() => {
		jest.clearAllMocks()
		mockStateManager = {
			getState: jest.fn(() => ({ success: true, data: { ...baseState } })),
			updateState: jest.fn(() => ({ success: true, data: { ...baseState, updated: true } })),
		} as unknown as jest.Mocked<StateManager>
		mockConfig = { baseUrl: 'url', username: 'u', apiToken: 't' }
	})

	test('returns success for valid update', async () => {
		const exec = updateStateWizardToolExecutor(mockStateManager, mockConfig)
		const result = await exec({
			arguments: { step: WizardStep.REVIEW, projectKey: 'PROJ', issueTypeId: '10001', fields: { foo: 'bar' } },
		})
		expect(createSuccessResult).toHaveBeenCalled()
		expect(result.content[0].text).toContain('Wizard state updated successfully')
	})

	test('returns error if step validation fails', async () => {
		validateStep.mockReturnValueOnce('bad step')
		const exec = updateStateWizardToolExecutor(mockStateManager, mockConfig)
		const result = await exec({ arguments: { step: 'bad' } })
		expect(createErrorResult).toHaveBeenCalledWith('bad step')
		expect(result.isError).toBe(true)
	})

	test('returns error if getState fails', async () => {
		mockStateManager.getState.mockReturnValueOnce({ success: false, error: { message: 'fail', code: 'E' } })
		const exec = updateStateWizardToolExecutor(mockStateManager, mockConfig)
		const result = await exec({ arguments: {} })
		expect(createErrorResult).toHaveBeenCalledWith('Cannot update state: fail')
		expect(result.isError).toBe(true)
	})

	test('returns error if projectKey validation fails', async () => {
		validateProjectKey.mockResolvedValueOnce('bad project')
		const exec = updateStateWizardToolExecutor(mockStateManager, mockConfig)
		const result = await exec({ arguments: { projectKey: 'bad' } })
		expect(createErrorResult).toHaveBeenCalledWith('bad project')
		expect(result.isError).toBe(true)
	})

	test('returns error if issueTypeId validation fails', async () => {
		validateIssueTypeId.mockResolvedValueOnce('bad type')
		const exec = updateStateWizardToolExecutor(mockStateManager, mockConfig)
		const result = await exec({ arguments: { issueTypeId: 'bad' } })
		expect(createErrorResult).toHaveBeenCalledWith('bad type')
		expect(result.isError).toBe(true)
	})

	test('returns error if updateState fails', async () => {
		mockStateManager.updateState.mockReturnValueOnce({ success: false, error: { message: 'update fail', code: 'E' } })
		const exec = updateStateWizardToolExecutor(mockStateManager, mockConfig)
		const result = await exec({ arguments: { step: WizardStep.REVIEW } })
		expect(createErrorResult).toHaveBeenCalledWith('update fail')
		expect(result.isError).toBe(true)
	})

	test('uses original state data when verification fails', async () => {
		// Setup: verification fails with an error string
		verifyStateUpdate.mockReturnValueOnce('verification failed')

		// Setup the verification state to be unsuccessful
		mockStateManager.getState
			// First call during regular flow
			.mockReturnValueOnce({ success: true, data: { ...baseState } })
			// Second call during verification
			.mockReturnValueOnce({ success: false, error: { message: 'verification failed', code: 'E' } })

		// Setup the update state
		const updatedState = {
			...baseState,
			currentStep: WizardStep.REVIEW, // this will be added by the executor
		}
		mockStateManager.updateState.mockReturnValueOnce({ success: true, data: updatedState })

		const exec = updateStateWizardToolExecutor(mockStateManager, mockConfig)
		const result = await exec({ arguments: { step: WizardStep.REVIEW } })

		// Check that we get success
		expect(result.content[0].text).toContain('Wizard state updated successfully')

		// Check that createSuccessResult was called with the right data
		expect(createSuccessResult).toHaveBeenCalledWith({
			success: true,
			message: 'Wizard state updated successfully',
			state: expect.objectContaining({
				currentStep: WizardStep.REVIEW, // The step will be forced to match the requested step
			}),
		})
	})

	test('uses verification result data when verification succeeds', async () => {
		// Setup: verification state is successful
		const verificationState = {
			...baseState,
			currentStep: WizardStep.REVIEW, // will be added by the executor
		}
		mockStateManager.getState
			// First call during regular flow
			.mockReturnValueOnce({ success: true, data: { ...baseState } })
			// Second call during verification
			.mockReturnValueOnce({ success: true, data: verificationState })

		// Verification should not return an error
		verifyStateUpdate.mockReturnValueOnce(null)

		// Setup the update state
		const updatedState = {
			...baseState,
			currentStep: WizardStep.FIELD_COMPLETION, // different than requested to test patching
		}
		mockStateManager.updateState.mockReturnValueOnce({ success: true, data: updatedState })

		const exec = updateStateWizardToolExecutor(mockStateManager, mockConfig)
		const result = await exec({ arguments: { step: WizardStep.REVIEW } })

		// Check that we get success
		expect(result.content[0].text).toContain('Wizard state updated successfully')

		// Check that createSuccessResult was called with the right data
		expect(createSuccessResult).toHaveBeenCalledWith({
			success: true,
			message: 'Wizard state updated successfully',
			state: expect.objectContaining({
				currentStep: WizardStep.REVIEW, // The step will be forced to match the requested step
			}),
		})
	})

	test('returns error on unexpected exception', async () => {
		mockStateManager.getState.mockImplementationOnce(() => {
			throw new Error('boom')
		})
		const exec = updateStateWizardToolExecutor(mockStateManager, mockConfig)
		const result = await exec({ arguments: {} })
		expect(createErrorResult).toHaveBeenCalledWith('boom')
		expect(result.isError).toBe(true)
	})
})
