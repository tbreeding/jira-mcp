import { WizardStep } from '../../types'
import { updateStateWizardToolExecutor } from '../updateStateExecutor'
import type { StateManager } from '../../stateManager'
import * as utils from '../utils'

// Add mock for utils
jest.mock('../utils')

// Mock Jira API functions used for validation
jest.mock('../../../../jira/api/getProjects', () => ({
	getProjectByKey: jest.fn().mockImplementation((key) => {
		if (key === 'INVALID') {
			return Promise.resolve({
				success: false,
				error: { message: 'Project not found' },
			})
		}
		return Promise.resolve({
			success: true,
			value: { id: '10000', key, name: 'Test Project' },
		})
	}),
}))

jest.mock('../../../../jira/api/getIssueTypeById', () => ({
	getIssueTypeById: jest.fn().mockImplementation((projectKey, issueTypeId) => {
		if (issueTypeId === 'INVALID') {
			return Promise.resolve({
				success: false,
				error: { message: 'Issue type not found' },
			})
		}
		return Promise.resolve({
			success: true,
			value: { id: issueTypeId, name: 'Test Issue Type' },
		})
	}),
}))

describe('Update State Wizard Tool Executor', () => {
	let mockStateManager: StateManager

	beforeEach(() => {
		jest.clearAllMocks()
		// Create mock StateManager
		mockStateManager = {
			updateState: jest.fn().mockReturnValue({
				success: true,
				data: { currentStep: WizardStep.PROJECT_SELECTION, projectKey: 'TEST' },
			}),
			getState: jest.fn().mockReturnValue({
				success: true,
				data: { currentStep: WizardStep.PROJECT_SELECTION, projectKey: 'TEST' },
			}),
			// Add the core property to satisfy TypeScript
			core: {
				getData: jest.fn(),
				updateData: jest.fn(),
			},
		} as unknown as StateManager
	})

	test('should update state with step parameter', async () => {
		const step = WizardStep.PROJECT_SELECTION
		;(mockStateManager.getState as jest.Mock).mockReturnValue({
			success: true,
			data: { currentStep: WizardStep.INITIATE },
		})
		;(mockStateManager.updateState as jest.Mock).mockReturnValue({
			success: true,
			data: { currentStep: step },
		})

		// Mock the expected success result
		const mockSuccessData = { currentStep: step }
		const mockExpectedSuccessResult = {
			content: [
				{
					type: 'text',
					text: JSON.stringify({ success: true, message: 'Wizard state updated successfully', state: mockSuccessData }),
				},
			],
		}
		;(utils.createSuccessResult as jest.Mock).mockReturnValue(mockExpectedSuccessResult)

		const executor = updateStateWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: { step } })

		expect(mockStateManager.updateState).toHaveBeenCalledWith({
			currentStep: step,
		})
		expect(result.content[0].text).toContain('success')
		expect(JSON.parse(result.content[0].text).state).toEqual({ currentStep: step })
	})

	test('should update state with multiple parameters', async () => {
		const params = {
			step: WizardStep.ISSUE_TYPE_SELECTION,
			projectKey: 'TEST',
			issueTypeId: '10001',
			fields: { summary: 'Test Issue' },
		}

		;(mockStateManager.updateState as jest.Mock).mockReturnValue({
			success: true,
			data: {
				currentStep: params.step,
				projectKey: params.projectKey,
				issueTypeId: params.issueTypeId,
				fields: params.fields,
			},
		})

		// Mock the expected success result
		const mockSuccessDataMultiple = {
			currentStep: params.step,
			projectKey: params.projectKey,
			issueTypeId: params.issueTypeId,
			fields: params.fields,
		}
		const mockExpectedSuccessResultMultiple = {
			content: [
				{
					type: 'text',
					text: JSON.stringify({
						success: true,
						message: 'Wizard state updated successfully',
						state: mockSuccessDataMultiple,
					}),
				},
			],
		}
		;(utils.createSuccessResult as jest.Mock).mockReturnValue(mockExpectedSuccessResultMultiple)

		const executor = updateStateWizardToolExecutor(mockStateManager, {} as any)
		const result = await executor({ arguments: params })

		expect(mockStateManager.updateState).toHaveBeenCalledWith({
			currentStep: params.step,
			projectKey: params.projectKey,
			issueTypeId: params.issueTypeId,
			fields: params.fields,
		})
		expect(result.content[0].text).toContain('success')
	})

	test('should update state with only some parameters', async () => {
		const params = {
			projectKey: 'PROJ',
			fields: { description: 'Test description' },
		}

		;(mockStateManager.updateState as jest.Mock).mockReturnValue({
			success: true,
			data: {
				projectKey: params.projectKey,
				fields: params.fields,
			},
		})

		// Mock the expected success result
		const mockSuccessDataSome = {
			projectKey: params.projectKey,
			fields: params.fields,
		}
		const mockExpectedSuccessResultSome = {
			content: [
				{
					type: 'text',
					text: JSON.stringify({
						success: true,
						message: 'Wizard state updated successfully',
						state: mockSuccessDataSome,
					}),
				},
			],
		}
		;(utils.createSuccessResult as jest.Mock).mockReturnValue(mockExpectedSuccessResultSome)

		const executor = updateStateWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: params })

		expect(mockStateManager.updateState).toHaveBeenCalledWith({
			projectKey: params.projectKey,
			fields: params.fields,
		})
		expect(result.content[0].text).toContain('success')
	})

	test('should return error for invalid step', async () => {
		const executor = updateStateWizardToolExecutor(mockStateManager)

		// Mock the expected error result
		const mockExpectedErrorResultInvalidStep = {
			content: [{ type: 'text', text: 'Error: Invalid step: invalid_step' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockExpectedErrorResultInvalidStep)

		const result = await executor({ arguments: { step: 'invalid_step' } })

		expect(mockStateManager.updateState).not.toHaveBeenCalled()
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toContain('Invalid step: invalid_step')
	})

	test('should return error when state update fails', async () => {
		;(mockStateManager.updateState as jest.Mock).mockReturnValue({
			success: false,
			error: { message: 'Failed to update state', code: 'UPDATE_ERROR' },
		})

		// Mock the expected error result
		const mockExpectedErrorResultUpdateFail = {
			content: [{ type: 'text', text: 'Error: Failed to update state' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockExpectedErrorResultUpdateFail)

		const executor = updateStateWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: { projectKey: 'TEST' } })

		expect(mockStateManager.updateState).toHaveBeenCalled()
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toContain('Failed to update state')
	})

	test('should handle unexpected errors', async () => {
		;(mockStateManager.updateState as jest.Mock).mockImplementation(() => {
			throw new Error('Unexpected error')
		})

		// Mock the expected error result for unexpected error
		const mockExpectedErrorResultUnexpected = {
			content: [{ type: 'text', text: 'Error: Unexpected error' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockExpectedErrorResultUnexpected)

		const executor = updateStateWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: { projectKey: 'TEST' } })

		expect(mockStateManager.updateState).toHaveBeenCalled()
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toContain('Unexpected error')
	})

	test('should validate project key when step is PROJECT_SELECTION', async () => {
		const params = {
			step: WizardStep.PROJECT_SELECTION,
			projectKey: 'INVALID',
		}

		// Mock the expected error result for invalid project key
		const mockExpectedErrorResultInvalidProj = {
			content: [{ type: 'text', text: 'Error: Invalid project key: INVALID' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockExpectedErrorResultInvalidProj)

		const executor = updateStateWizardToolExecutor(mockStateManager, {} as any)
		const result = await executor({ arguments: params })

		expect(mockStateManager.updateState).not.toHaveBeenCalled()
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toContain('Invalid project key')
	})

	test('should validate issue type when step is ISSUE_TYPE_SELECTION', async () => {
		const params = {
			step: WizardStep.ISSUE_TYPE_SELECTION,
			issueTypeId: 'INVALID',
		}

		// Mock the expected error result for invalid issue type
		const mockExpectedErrorResultInvalidType = {
			content: [{ type: 'text', text: 'Error: Invalid issue type ID: INVALID' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockExpectedErrorResultInvalidType)

		const executor = updateStateWizardToolExecutor(mockStateManager, {} as any)
		const result = await executor({ arguments: params })

		expect(mockStateManager.updateState).not.toHaveBeenCalled()
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toContain('Invalid issue type ID')
	})

	test('should return error when getState fails', async () => {
		// Mocking getState to return unsuccessful result
		;(mockStateManager.getState as jest.Mock).mockReturnValue({
			success: false,
			error: { message: 'Failed to get state', code: 'GET_STATE_ERROR' },
		})

		// Mock the expected error result for getState failure
		const mockExpectedErrorResultGetFail = {
			content: [{ type: 'text', text: 'Error: Cannot update state: Failed to get state' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockExpectedErrorResultGetFail)

		const executor = updateStateWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: { projectKey: 'TEST' } })

		expect(mockStateManager.updateState).not.toHaveBeenCalled()
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toContain('Cannot update state: Failed to get state')
	})

	test('should return error when no project key is available for issue type validation', async () => {
		// Mocking getState to return state without projectKey
		;(mockStateManager.getState as jest.Mock).mockReturnValue({
			success: true,
			data: { currentStep: WizardStep.ISSUE_TYPE_SELECTION },
		})

		const params = {
			step: WizardStep.ISSUE_TYPE_SELECTION,
			issueTypeId: '10001',
			// No projectKey provided
		}

		// Mock the expected error result for missing project key during validation
		const mockExpectedErrorResultNoProjValid = {
			content: [{ type: 'text', text: 'Error: Cannot validate issue type: No project key available' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockExpectedErrorResultNoProjValid)

		const executor = updateStateWizardToolExecutor(mockStateManager, {} as any)
		const result = await executor({ arguments: params })

		expect(mockStateManager.updateState).not.toHaveBeenCalled()
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toContain('Cannot validate issue type: No project key available')
	})

	test('should correctly transition from initiate to project_selection', async () => {
		// Mocking getState to return initial state
		;(mockStateManager.getState as jest.Mock).mockReturnValue({
			success: true,
			data: { currentStep: WizardStep.INITIATE },
		})

		// Mock successful state update
		;(mockStateManager.updateState as jest.Mock).mockReturnValue({
			success: true,
			data: {
				currentStep: WizardStep.PROJECT_SELECTION,
				projectKey: 'TEST-1',
			},
		})

		const params = {
			step: WizardStep.PROJECT_SELECTION,
			projectKey: 'TEST-1',
		}

		// Mock the expected success result for transition
		const mockSuccessDataTransition = {
			currentStep: WizardStep.PROJECT_SELECTION,
			projectKey: 'TEST-1',
		}
		const mockExpectedSuccessResultTransition = {
			content: [
				{
					type: 'text',
					text: JSON.stringify({
						success: true,
						message: 'Wizard state updated successfully',
						state: mockSuccessDataTransition,
					}),
				},
			],
		}
		;(utils.createSuccessResult as jest.Mock).mockReturnValue(mockExpectedSuccessResultTransition)

		const executor = updateStateWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: params })

		expect(mockStateManager.updateState).toHaveBeenCalledWith({
			currentStep: WizardStep.PROJECT_SELECTION,
			projectKey: 'TEST-1',
		})
		expect(result).toEqual(mockExpectedSuccessResultTransition) // Simplified assertion
	})

	test('should return updated state from updateState result when verification getState fails', async () => {
		const initialStep = WizardStep.INITIATE
		const targetStep = WizardStep.PROJECT_SELECTION
		const targetProjectKey = 'NEWPROJ'

		// Mock initial getState
		;(mockStateManager.getState as jest.Mock)
			.mockReturnValueOnce({
				success: true,
				data: { currentStep: initialStep }, // Initial state
			})
			.mockReturnValueOnce({
				success: false, // Mock verification getState failure
				error: { message: 'Verification failed', code: 'GET_STATE_ERROR' },
			})

		// Mock updateState success
		const updateResultData = { currentStep: targetStep, projectKey: targetProjectKey }
		;(mockStateManager.updateState as jest.Mock).mockReturnValue({
			success: true,
			data: updateResultData,
		})

		// Mock createSuccessResult to verify its input
		const mockSuccessResult = { content: [{ type: 'text', text: 'success' }] }
		;(utils.createSuccessResult as jest.Mock).mockReturnValue(mockSuccessResult)

		const executor = updateStateWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: { step: targetStep, projectKey: targetProjectKey } })

		// Verify updateState was called
		expect(mockStateManager.updateState).toHaveBeenCalledWith({ currentStep: targetStep, projectKey: targetProjectKey })

		// Verify verification getState was called
		expect(mockStateManager.getState).toHaveBeenCalledTimes(2)

		// Verify success result was created using the updateState data, patched with provided params
		expect(utils.createSuccessResult).toHaveBeenCalledWith({
			success: true,
			message: 'Wizard state updated successfully',
			state: {
				// Base state should come from updateResultData
				...updateResultData,
				// Explicitly check patched values
				currentStep: targetStep,
				projectKey: targetProjectKey,
			},
		})

		// Verify the final result returned is the mocked success result
		expect(result).toBe(mockSuccessResult)
	})
})
