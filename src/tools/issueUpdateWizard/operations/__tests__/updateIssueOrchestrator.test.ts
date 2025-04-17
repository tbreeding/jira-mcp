import { describe, it, expect, beforeEach } from '@jest/globals'
import { Success, Failure } from '../../../../utils/try'
import { updateIssueFromState } from '../updateIssueOrchestrator'
import { WizardStep } from '../../../issueCreationWizard/types'
import type { StateManager } from '../../../issueCreationWizard/stateManager'
import type { JiraApiConfig } from '../../../../jira/api/apiTypes'
import type { ErrorObject } from '../../../../errors/types'
import type { WizardState } from '../../../issueCreationWizard/types'

// Mock dependencies
jest.mock('../../../../utils/logger', () => ({
	log: jest.fn(),
}))

// Mock updateIssue function
jest.mock('../updateIssue', () => ({
	updateIssue: jest.fn(),
}))

// Import the mocked module after mocking
import { updateIssue } from '../updateIssue'

describe('updateIssueOrchestrator', () => {
	let mockStateManager: StateManager
	let mockConfig: JiraApiConfig

	beforeEach(() => {
		// Clear mocks before each test
		jest.clearAllMocks()

		// Create mock state manager
		mockStateManager = {
			getState: jest.fn(),
			resetState: jest.fn(),
			updateState: jest.fn(),
			initializeState: jest.fn(),
			isActive: jest.fn(),
			serializeState: jest.fn(),
			deserializeState: jest.fn(),
		} as unknown as StateManager

		// Create mock config
		mockConfig = {} as JiraApiConfig
	})

	it('should return failure when getState fails', async () => {
		// Arrange
		const mockError: ErrorObject = {
			message: 'Failed to get state',
			code: 'TEST_ERROR',
		}

		;(mockStateManager.getState as jest.Mock).mockReturnValue({
			success: false,
			error: mockError,
		})

		// Act
		const result = await updateIssueFromState(mockStateManager, mockConfig)

		// Assert
		expect(result).toEqual(Failure(new Error('Failed to get state')))
		expect(updateIssue).not.toHaveBeenCalled()
	})

	it('should return failure when issueKey is missing', async () => {
		// Arrange
		const mockState: Partial<WizardState> = {
			active: true,
			currentStep: WizardStep.FIELD_COMPLETION,
			fields: {},
			validation: { errors: {}, warnings: {} },
			timestamp: Date.now(),
		}

		;(mockStateManager.getState as jest.Mock).mockReturnValue({
			success: true,
			data: mockState,
		})

		// Act
		const result = await updateIssueFromState(mockStateManager, mockConfig)

		// Assert
		expect(result).toEqual(Failure(new Error('Cannot update issue: No issue key in state')))
		expect(updateIssue).not.toHaveBeenCalled()
	})

	it('should return success when updateIssue succeeds', async () => {
		// Arrange
		const issueKey = 'TEST-123'
		const mockState: Partial<WizardState> = {
			active: true,
			currentStep: WizardStep.FIELD_COMPLETION,
			issueKey,
			fields: { summary: 'Test issue' },
			validation: { errors: {}, warnings: {} },
			timestamp: Date.now(),
		}

		;(mockStateManager.getState as jest.Mock).mockReturnValue({
			success: true,
			data: mockState,
		})

		const successResponse: string = 'Issue updated successfully'
		;(updateIssue as jest.Mock).mockResolvedValue(Success(successResponse))

		// Act
		const result = await updateIssueFromState(mockStateManager, mockConfig)

		// Assert
		expect(result).toEqual(Success(successResponse))
		expect(updateIssue).toHaveBeenCalledWith(
			expect.objectContaining({
				issueKey,
				fields: expect.any(Object),
			}),
			mockConfig,
		)
	})

	it('should return failure when updateIssue fails', async () => {
		// Arrange
		const issueKey = 'TEST-123'
		const mockState: Partial<WizardState> = {
			active: true,
			currentStep: WizardStep.FIELD_COMPLETION,
			issueKey,
			fields: { summary: 'Test issue' },
			validation: { errors: {}, warnings: {} },
			timestamp: Date.now(),
		}

		;(mockStateManager.getState as jest.Mock).mockReturnValue({
			success: true,
			data: mockState,
		})

		const errorResponse = new Error('Failed to update issue')
		;(updateIssue as jest.Mock).mockResolvedValue(Failure(errorResponse))

		// Act
		const result = await updateIssueFromState(mockStateManager, mockConfig)

		// Assert
		expect(result).toEqual(Failure(errorResponse))
		expect(updateIssue).toHaveBeenCalledWith(
			expect.objectContaining({
				issueKey,
				fields: expect.any(Object),
			}),
			mockConfig,
		)
	})

	it('should handle unexpected errors', async () => {
		// Arrange
		const issueKey = 'TEST-123'
		const mockState: Partial<WizardState> = {
			active: true,
			currentStep: WizardStep.FIELD_COMPLETION,
			issueKey,
			fields: { summary: 'Test issue' },
			validation: { errors: {}, warnings: {} },
			timestamp: Date.now(),
		}

		;(mockStateManager.getState as jest.Mock).mockReturnValue({
			success: true,
			data: mockState,
		})

		const unexpectedError = new Error('Unexpected error')
		;(updateIssue as jest.Mock).mockRejectedValue(unexpectedError)

		// Act
		const result = await updateIssueFromState(mockStateManager, mockConfig)

		// Assert
		expect(result).toEqual(Failure(unexpectedError))
	})
})
