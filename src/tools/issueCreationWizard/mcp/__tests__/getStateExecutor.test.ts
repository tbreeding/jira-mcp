import { WizardStep } from '../../types'
import { getStateWizardToolExecutor } from '../getStateExecutor'
import type { ErrorResult } from '../../../../errors/types'
import type { StateManager } from '../../stateManager'
import type { WizardState } from '../../types'

// Remove mock for StateManager
// jest.mock('../../stateManager')
jest.mock('../../../../utils/logger', () => ({
	log: jest.fn(),
}))

describe('getStateWizardToolExecutor', () => {
	// Properly type the mock
	let mockStateManager: jest.Mocked<StateManager>

	beforeEach(() => {
		jest.clearAllMocks()

		// Create mock state manager with Jest mock functions
		mockStateManager = {
			getState: jest.fn(),
			isActive: jest.fn(),
			initializeState: jest.fn(),
			resetState: jest.fn(),
			updateState: jest.fn(),
			serializeState: jest.fn(),
			deserializeState: jest.fn(),
			core: {},
		} as unknown as jest.Mocked<StateManager>
	})

	it('should return state data when state exists', async () => {
		// Setup mock with successful state
		const mockState: WizardState = {
			projectKey: 'PROJ',
			issueTypeId: 'issue-123',
			active: true,
			currentStep: WizardStep.FIELD_COMPLETION,
			fields: {
				summary: 'Test issue',
				description: 'Test description',
			},
			validation: { errors: {}, warnings: {} },
			timestamp: 123456789,
		}

		mockStateManager.getState.mockReturnValue({
			success: true,
			data: mockState,
		})

		// Execute
		const executor = getStateWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: {} })

		// Verify
		expect(result.isError).toBeUndefined()

		// Parse the JSON result
		const responseData = JSON.parse(result.content[0].text)
		expect(responseData).toEqual(mockState)
	})

	it('should return error when state retrieval fails', async () => {
		// Setup mock with failed state retrieval
		mockStateManager.getState.mockReturnValue({
			success: false,
			error: { message: 'No active wizard', code: 'NO_ACTIVE_WIZARD' },
		} as ErrorResult)

		// Execute
		const executor = getStateWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: {} })

		// Verify
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toBe('Error: No active wizard')
	})

	it('should handle exceptions and return error result', async () => {
		// Setup mock to throw exception
		mockStateManager.getState.mockImplementation(() => {
			throw new Error('Unexpected error')
		})

		// Execute
		const executor = getStateWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: {} })

		// Verify
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toBe('Error: Unexpected error')
	})
})
