/**
 * Reset State Wizard Tool Executor Tests
 *
 * This module contains unit tests for the resetState tool executor,
 * which resets the issue creation wizard state.
 */

import { resetStateWizardToolExecutor } from '../resetStateExecutor'
import type { StateManager } from '../../stateManager'

describe('Reset State Wizard Tool Executor', () => {
	const mockResetData = {
		active: false,
		timestamp: 123456789,
		fields: {},
		validation: { errors: {}, warnings: {} },
		currentStep: null,
		reset: true,
	}

	let mockStateManager: jest.Mocked<StateManager>

	beforeEach(() => {
		jest.clearAllMocks()

		// Create mock StateManager
		mockStateManager = {
			resetState: jest.fn(),
		} as unknown as jest.Mocked<StateManager>
	})

	it('should reset state successfully', async () => {
		// Mock the resetState method to return success
		mockStateManager.resetState.mockReturnValue({
			success: true,
			data: mockResetData,
		})

		// Create the executor with the mock StateManager
		const executor = resetStateWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: {} })

		expect(mockStateManager.resetState).toHaveBeenCalled()
		expect(result.content[0].text).toContain('"active": false')
	})

	it('should handle errors during state reset', async () => {
		// Mock the resetState method to throw an error
		mockStateManager.resetState.mockImplementation(() => {
			throw new Error('Failed to reset state')
		})

		// Create the executor with the mock StateManager
		const executor = resetStateWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: {} })

		expect(mockStateManager.resetState).toHaveBeenCalled()
		expect(result.content[0].text).toBe('Error: Failed to reset state')
		expect(result).toHaveProperty('isError', true)
	})

	it('should handle unexpected exceptions', async () => {
		// Mock the resetState method to throw an exception
		mockStateManager.resetState.mockImplementation(() => {
			throw new Error('Unexpected error during reset')
		})

		// Create the executor with the mock StateManager
		const executor = resetStateWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: {} })

		expect(mockStateManager.resetState).toHaveBeenCalled()
		expect(result.content[0].text).toBe('Error: Unexpected error during reset')
		expect(result).toHaveProperty('isError', true)
	})
})
