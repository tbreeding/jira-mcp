/**
 * Unit tests for getStatusExecutor
 *
 * Tests the functionality of the getStatusWizardToolExecutor
 */

import { WizardStep } from '../../types'
import { getStatusWizardToolExecutor } from '../getStatusExecutor'
import type { ErrorResult } from '../../../../errors/types'
import type { StateManager } from '../../stateManager'
import type { WizardState } from '../../types'

// Remove StateManager mock
// jest.mock('../../stateManager', () => {
// 	const mockGetState = jest.fn()
// 	const mockIsActive = jest.fn()

// 	return {
// 		StateManager: {
// 			getInstance: jest.fn().mockReturnValue({
// 				getState: mockGetState,
// 				isActive: mockIsActive,
// 			}),
// 		},
// 	}
// })

// Mock the status utility functions
jest.mock('../../utils/statusUtils', () => ({
	calculateProgress: jest.fn().mockReturnValue(42),
	calculateStepCompletion: jest.fn().mockReturnValue({ complete: true, requiredFields: [] }),
}))

describe('getStatusWizardToolExecutor', () => {
	// Create mock StateManager directly
	let mockStateManager: jest.Mocked<StateManager>

	beforeEach(() => {
		jest.clearAllMocks()

		// Initialize mock StateManager
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

	it('should return inactive status when no wizard is active', async () => {
		// Setup
		mockStateManager.isActive.mockReturnValue(false)

		// Execute
		const executor = getStatusWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: {} })

		// Verify
		expect(mockStateManager.isActive).toHaveBeenCalled()
		expect(result.content).toHaveLength(1)

		const status = JSON.parse(result.content[0].text)
		expect(status.active).toBe(false)
		expect(status.timeElapsed).toBe(0)
		expect(status.currentStep).toBeUndefined()
	})

	it('should return active status with details when wizard is active', async () => {
		// Setup
		const mockTimestamp = Date.now() - 5000 // 5 seconds ago

		mockStateManager.isActive.mockReturnValue(true)
		mockStateManager.getState.mockReturnValue({
			success: true,
			data: {
				active: true,
				currentStep: WizardStep.PROJECT_SELECTION,
				timestamp: mockTimestamp,
				validation: {
					errors: {},
					warnings: {},
				},
				fields: {},
			} as WizardState,
		})

		// Execute
		const executor = getStatusWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: {} })

		// Verify
		expect(mockStateManager.isActive).toHaveBeenCalled()
		expect(mockStateManager.getState).toHaveBeenCalled()
		expect(result.content).toHaveLength(1)

		const status = JSON.parse(result.content[0].text)
		expect(status.active).toBe(true)
		expect(status.currentStep).toBe(WizardStep.PROJECT_SELECTION)
		expect(status.timestamp).toBe(mockTimestamp)
		expect(status.timeElapsed).toBeGreaterThan(0)
		expect(status.progress).toBe(42) // From our mock
		expect(status.stepCompletion).toEqual({ complete: true, requiredFields: [] }) // From our mock
	})

	it('should return error status when getState fails', async () => {
		// Setup
		mockStateManager.isActive.mockReturnValue(true)
		mockStateManager.getState.mockReturnValue({
			success: false,
			error: {
				message: 'Test error',
				code: 'TEST_ERROR',
			},
		} as ErrorResult)

		// Execute
		const executor = getStatusWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: {} })

		// Verify
		expect(mockStateManager.isActive).toHaveBeenCalled()
		expect(mockStateManager.getState).toHaveBeenCalled()
		expect(result.content).toHaveLength(1)

		// We expect raw error text rather than JSON
		expect(result.content[0].text).toContain('Failed to retrieve wizard state details')
	})

	it('should return validation errors when present', async () => {
		// Setup
		mockStateManager.isActive.mockReturnValue(true)
		mockStateManager.getState.mockReturnValue({
			success: true,
			data: {
				active: true,
				currentStep: WizardStep.FIELD_COMPLETION,
				timestamp: Date.now(),
				validation: {
					errors: {
						summary: ['Summary is required'],
						description: ['Description must not be empty'],
					},
					warnings: {},
				},
				fields: {},
			} as WizardState,
		})

		// Execute
		const executor = getStatusWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: {} })

		// Verify
		expect(mockStateManager.isActive).toHaveBeenCalled()
		expect(mockStateManager.getState).toHaveBeenCalled()
		expect(result.content).toHaveLength(1)

		const status = JSON.parse(result.content[0].text)
		expect(status.active).toBe(true)
		expect(status.hasValidationErrors).toBe(true)
		expect(status.validationErrorCount).toBe(2)
	})

	it('should handle exceptions gracefully', async () => {
		// Setup
		mockStateManager.isActive.mockImplementation(() => {
			throw new Error('Unexpected error')
		})

		// Execute
		const executor = getStatusWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: {} })

		// Verify
		expect(mockStateManager.isActive).toHaveBeenCalled()
		expect(result.content).toHaveLength(1)

		// We expect raw error text rather than JSON
		expect(result.content[0].text).toContain('Unexpected error')
	})
})
