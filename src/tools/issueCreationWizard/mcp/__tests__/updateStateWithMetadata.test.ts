import { updateStateWithMetadata } from '../updateStateWithMetadata'
import { createProcessErrorResult } from '../utils'
import type { ProcessResult } from '../utils'
import type { StateManager } from '../../stateManager'
import { WizardStep } from '../../types'
import type { WizardState } from '../../types'
import type { ErrorResult, SuccessResult } from '../../../../errors/types'
import type { CategorizedFields } from '../../../../jira/api/getAndCategorizeFields'
import { FieldCategory } from '../../../../jira/types/fieldMetadata.types'
import { log } from '../../../../utils/logger'

// Mocks
jest.mock('../utils', () => ({
	createProcessErrorResult: jest.fn((message: string): ProcessResult => ({ success: false, message })),
}))
jest.mock('../../../../utils/logger', () => ({
	log: jest.fn(),
}))

describe('updateStateWithMetadata', () => {
	let mockStateManager: {
		updateState: jest.Mock<Promise<SuccessResult<WizardState> | ErrorResult>, [Partial<WizardState>]>
		getState: jest.Mock<Promise<SuccessResult<WizardState> | ErrorResult>, []>
	}
	let mockCurrentState: WizardState
	let mockMetadata: CategorizedFields

	beforeEach(() => {
		jest.clearAllMocks()

		// Define the minimal mock object
		mockStateManager = {
			updateState: jest.fn(),
			getState: jest.fn(),
		}

		// Setup mockCurrentState and mockMetadata as before
		mockCurrentState = {
			active: true,
			currentStep: WizardStep.FIELD_COMPLETION,
			projectKey: 'PROJ',
			issueTypeId: 'type-1',
			fields: { existing: 'value' },
			validation: { errors: {}, warnings: {} },
			analysis: { complexity: { score: 5 } },
			timestamp: Date.now(),
		}
		mockMetadata = {
			standard: [
				{
					id: 'summary',
					name: 'Summary',
					category: FieldCategory.REQUIRED,
					metadata: {
						id: 'summary',
						name: 'Summary',
						required: true,
						schema: { type: 'string' } as any,
					},
				},
			],
		}
	})

	it('should update state, refresh, and return success with updated state', async () => {
		// Arrange
		const updatedState = { ...mockCurrentState, analysis: { ...mockCurrentState.analysis, metadata: mockMetadata } }
		mockStateManager.updateState.mockResolvedValue({ success: true } as SuccessResult<WizardState>)
		mockStateManager.getState.mockResolvedValue({ success: true, data: updatedState } as SuccessResult<WizardState>)

		// Act
		const result = await updateStateWithMetadata(
			mockStateManager as unknown as StateManager,
			mockCurrentState,
			mockMetadata,
		)

		// Assert
		expect(mockStateManager.updateState).toHaveBeenCalledWith({
			analysis: {
				complexity: { score: 5 },
				metadata: mockMetadata,
			},
		})
		expect(mockStateManager.getState).toHaveBeenCalledTimes(1)
		expect(result).toEqual<ProcessResult>({
			success: true,
			message: 'State updated successfully with metadata.',
			data: updatedState,
		})
		expect(log).toHaveBeenCalledWith('DEBUG: Updating wizard state with fetched field metadata.')
		expect(log).toHaveBeenCalledWith('DEBUG: Wizard state updated successfully with metadata and refreshed.')
	})

	it('should return error if updateState fails', async () => {
		// Arrange
		const updateError = new Error('DB write failed')
		mockStateManager.updateState.mockRejectedValue(updateError)

		// Act
		const result = await updateStateWithMetadata(
			mockStateManager as unknown as StateManager,
			mockCurrentState,
			mockMetadata,
		)

		// Assert
		expect(mockStateManager.updateState).toHaveBeenCalledTimes(1)
		expect(mockStateManager.getState).not.toHaveBeenCalled()
		expect(createProcessErrorResult).toHaveBeenCalledWith(
			'Failed to update wizard state with metadata: DB write failed',
		)
		expect(result).toEqual({ success: false, message: 'Failed to update wizard state with metadata: DB write failed' })
		expect(log).toHaveBeenCalledWith('ERROR: Failed to update wizard state with metadata: DB write failed', updateError)
	})

	it('should return error if getState fails after successful update', async () => {
		// Arrange
		const getStateError: ErrorResult = { success: false, error: { message: 'Failed to read state' } } as ErrorResult
		mockStateManager.updateState.mockResolvedValue({ success: true } as SuccessResult<WizardState>)
		mockStateManager.getState.mockResolvedValue(getStateError)

		// Act
		const result = await updateStateWithMetadata(
			mockStateManager as unknown as StateManager,
			mockCurrentState,
			mockMetadata,
		)

		// Assert
		expect(mockStateManager.updateState).toHaveBeenCalledTimes(1)
		expect(mockStateManager.getState).toHaveBeenCalledTimes(1)
		expect(createProcessErrorResult).toHaveBeenCalledWith('Failed to refresh state after metadata update.')
		expect(result).toEqual({ success: false, message: 'Failed to refresh state after metadata update.' })
		expect(log).toHaveBeenCalledWith('ERROR: Failed to refresh state after metadata update.')
	})

	it('should handle non-Error exceptions during updateState', async () => {
		// Arrange
		const nonError = 'something broke'
		mockStateManager.updateState.mockRejectedValue(nonError)

		// Act
		const result = await updateStateWithMetadata(
			mockStateManager as unknown as StateManager,
			mockCurrentState,
			mockMetadata,
		)

		const errorMessage = 'Failed to update wizard state with metadata: Unknown error during state update with metadata'
		// Assert
		expect(createProcessErrorResult).toHaveBeenCalledWith(errorMessage)
		expect(result).toEqual({
			success: false,
			message: errorMessage,
		})
		expect(log).toHaveBeenCalledWith(`ERROR: ${errorMessage}`, expect.any(Error))
	})

	it('should handle analysis field being initially undefined', async () => {
		// Arrange
		const stateWithoutAnalysis = { ...mockCurrentState, analysis: undefined }
		const updatedState = { ...stateWithoutAnalysis, analysis: { metadata: mockMetadata } }
		mockStateManager.updateState.mockResolvedValue({ success: true } as SuccessResult<WizardState>)
		mockStateManager.getState.mockResolvedValue({ success: true, data: updatedState } as SuccessResult<WizardState>)

		// Act
		const result = await updateStateWithMetadata(
			mockStateManager as unknown as StateManager,
			stateWithoutAnalysis,
			mockMetadata,
		)

		// Assert
		expect(mockStateManager.updateState).toHaveBeenCalledWith({
			analysis: {
				metadata: mockMetadata,
			},
		})
		expect(result.success).toBe(true)
		if (result.success) {
			const resultData = result.data as WizardState
			expect(resultData.analysis).toBeDefined()
			expect(resultData.analysis?.metadata).toEqual(mockMetadata)
		} else {
			fail('Expected result to be successful')
		}
	})
})
