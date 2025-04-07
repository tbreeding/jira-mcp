/**
 * Tests for setConfirmationFlags
 *
 * This file contains tests for the setUserConfirmation and setAnalysisComplete
 * functions that update the wizard state flags.
 */

import { setUserConfirmation, setAnalysisComplete } from '../setConfirmationFlags'
import type { StateManager } from '../../stateManager'

// Mock the StateManager
const createMockStateManager = (options: {
	getStateSuccess?: boolean
	updateStateSuccess?: boolean
	stateExists?: boolean
}): StateManager => {
	const { getStateSuccess = true, updateStateSuccess = true, stateExists = true } = options

	return {
		getState: jest
			.fn()
			.mockReturnValue(
				getStateSuccess
					? { success: true, data: stateExists ? { someState: true } : null }
					: { success: false, error: { code: 'INVALID_PARAMETERS', message: 'Error getting state' } },
			),
		updateState: jest
			.fn()
			.mockReturnValue(
				updateStateSuccess
					? { success: true, data: { message: 'Update successful' } }
					: { success: false, error: { code: 'INVALID_PARAMETERS', message: 'Error updating state' } },
			),
		resetState: jest.fn(),
		initializeState: jest.fn(),
	} as unknown as StateManager
}

describe('setUserConfirmation', () => {
	it('should update user confirmation when state exists', () => {
		// Arrange
		const stateManager = createMockStateManager({})
		const options = { confirmed: true }

		// Act
		const result = setUserConfirmation(stateManager, options)

		// Assert
		expect(result.isError).toBeUndefined()
		expect(JSON.parse(result.content[0].text).message).toContain('User confirmation updated to: true')
		expect(stateManager.getState).toHaveBeenCalled()
		expect(stateManager.updateState).toHaveBeenCalledWith({ userConfirmation: true })
	})

	it('should return error when no state exists', () => {
		// Arrange
		const stateManager = createMockStateManager({ getStateSuccess: false })
		const options = { confirmed: true }

		// Act
		const result = setUserConfirmation(stateManager, options)

		// Assert
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toBe('Error: No active wizard session found')
		expect(stateManager.getState).toHaveBeenCalled()
		expect(stateManager.updateState).not.toHaveBeenCalled()
	})

	it('should return error when updateState fails', () => {
		// Arrange
		const stateManager = createMockStateManager({})
		// Override the updateState mock for this specific test
		stateManager.updateState = jest.fn().mockReturnValue({
			success: false,
			error: { code: 'INVALID_PARAMETERS', message: 'Error updating state' },
		})
		const options = { confirmed: false }

		// Act
		const result = setUserConfirmation(stateManager, options)

		// Assert
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toContain('Error: Failed to update state')
		expect(stateManager.getState).toHaveBeenCalled()
		expect(stateManager.updateState).toHaveBeenCalledWith({ userConfirmation: false })
	})

	it('should handle unexpected errors', () => {
		// Arrange
		const stateManager = createMockStateManager({})
		const options = { confirmed: true }

		// Mock getState to throw an error
		stateManager.getState = jest.fn().mockImplementation(() => {
			throw new Error('Unexpected error')
		})

		// Act
		const result = setUserConfirmation(stateManager, options)

		// Assert
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toBe('Error: Failed to update user confirmation: Unexpected error')
		expect(stateManager.getState).toHaveBeenCalled()
		expect(stateManager.updateState).not.toHaveBeenCalled()
	})
})

describe('setAnalysisComplete', () => {
	it('should update analysis complete when state exists', () => {
		// Arrange
		const stateManager = createMockStateManager({})
		const options = { isComplete: true }

		// Act
		const result = setAnalysisComplete(stateManager, options)

		// Assert
		expect(result.isError).toBeUndefined()
		expect(JSON.parse(result.content[0].text).message).toContain('Analysis status updated to: true')
		expect(stateManager.getState).toHaveBeenCalled()
		expect(stateManager.updateState).toHaveBeenCalledWith({ analysisComplete: true })
	})

	it('should return error when no state exists', () => {
		// Arrange
		const stateManager = createMockStateManager({ getStateSuccess: false })
		const options = { isComplete: true }

		// Act
		const result = setAnalysisComplete(stateManager, options)

		// Assert
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toBe('Error: No active wizard session found')
		expect(stateManager.getState).toHaveBeenCalled()
		expect(stateManager.updateState).not.toHaveBeenCalled()
	})

	it('should return error when updateState fails', () => {
		// Arrange
		const stateManager = createMockStateManager({})
		// Override the updateState mock for this specific test
		stateManager.updateState = jest.fn().mockReturnValue({
			success: false,
			error: { code: 'INVALID_PARAMETERS', message: 'Error updating state' },
		})
		const options = { isComplete: false }

		// Act
		const result = setAnalysisComplete(stateManager, options)

		// Assert
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toContain('Error: Failed to update state')
		expect(stateManager.getState).toHaveBeenCalled()
		expect(stateManager.updateState).toHaveBeenCalledWith({ analysisComplete: false })
	})

	it('should handle unexpected errors', () => {
		// Arrange
		const stateManager = createMockStateManager({})
		const options = { isComplete: true }

		// Mock getState to throw an error
		stateManager.getState = jest.fn().mockImplementation(() => {
			throw new Error('Unexpected error')
		})

		// Act
		const result = setAnalysisComplete(stateManager, options)

		// Assert
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toBe('Error: Failed to update analysis status: Unexpected error')
		expect(stateManager.getState).toHaveBeenCalled()
		expect(stateManager.updateState).not.toHaveBeenCalled()
	})
})
