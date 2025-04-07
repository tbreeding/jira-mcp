/**
 * Issue Creation Wizard InitiateState Tool Executor Tests
 *
 * This module contains unit tests for the initiateState tool executor,
 * which initializes a new state for the issue creation wizard.
 */

import { WizardStep } from '../../types'
import { initiateStateWizardToolExecutor } from '../initiateStateExecutor'
import { createSuccessResult, createErrorResult } from '../utils'
import type { StateManager } from '../../stateManager'
import type { WizardState } from '../../types'

// Mock dependencies
jest.mock('../utils')
jest.mock('../../../../utils/logger', () => ({
	log: jest.fn(),
}))

const mockCreateSuccessResult = createSuccessResult as jest.Mock
const mockCreateErrorResult = createErrorResult as jest.Mock

describe('initiateStateWizardToolExecutor', () => {
	let mockState: WizardState

	// Create mock state
	mockState = {
		currentStep: WizardStep.INITIATE,
		timestamp: Date.now(),
		active: true,
		fields: {},
		validation: {
			errors: {},
			warnings: {},
		},
	}

	const mockIsActive = jest.fn()
	const mockInitializeState = jest.fn()
	const mockGetState = jest.fn()
	const mockGetData = jest.fn()
	const mockUpdateData = jest.fn()
	// Create mock StateManager
	const mockStateManager = {
		isActive: mockIsActive,
		initializeState: mockInitializeState,
		getState: mockGetState,
		// Add the core property to satisfy TypeScript
		core: {
			getData: mockGetData,
			updateData: mockUpdateData,
		},
	} as unknown as StateManager

	beforeEach(() => {
		jest.clearAllMocks()

		// Set up mocks for utility functions
		mockCreateSuccessResult.mockImplementation((data: unknown) => ({
			content: [{ type: 'text', text: JSON.stringify(data) }],
		}))

		mockCreateErrorResult.mockImplementation((message: string) => ({
			content: [{ type: 'text', text: `Error: ${message}` }],
			isError: true,
		}))
	})

	test('should initialize state successfully when no wizard is active', async () => {
		// Mock that there is no active wizard
		mockIsActive.mockReturnValue(false).mockReturnValue(false)

		mockInitializeState.mockReturnValue({
			success: true,
			data: mockState,
		})

		// Create the executor and call it
		const executor = initiateStateWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: {} })

		// Verify the state manager was called correctly
		expect(mockIsActive).toHaveBeenCalled()
		expect(mockInitializeState).toHaveBeenCalled()

		// Verify the result
		expect(mockCreateSuccessResult).toHaveBeenCalledWith({
			success: true,
			message: 'Wizard state initialized successfully',
			state: mockState,
			sessionId: mockState.timestamp,
		})
		expect(result).toEqual(
			expect.objectContaining({
				content: expect.arrayContaining([
					expect.objectContaining({
						type: 'text',
						text: expect.stringContaining('Wizard state initialized successfully'),
					}),
				]),
			}),
		)
	})

	test('should return error when a wizard is already active', async () => {
		// Mock that there is an active wizard
		mockIsActive.mockReturnValue(true)

		const executor = initiateStateWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: {} })

		// Verify state initialization was not attempted
		expect(mockInitializeState).not.toHaveBeenCalled()

		// Verify the error result
		expect(mockCreateErrorResult).toHaveBeenCalledWith(
			'A wizard session is already active. Please call mcp_IssueCreationWizard_resetState first if you want to start a new session.',
		)
		expect(result).toEqual(
			expect.objectContaining({
				isError: true,
				content: expect.arrayContaining([
					expect.objectContaining({
						type: 'text',
						text: expect.stringContaining('A wizard session is already active'),
					}),
				]),
			}),
		)
	})

	test('should return error when state initialization fails', async () => {
		// Mock that there is no active wizard
		mockIsActive.mockReturnValue(false)

		mockInitializeState.mockReturnValue({
			success: false,
			error: { message: 'Failed to initialize state', code: 'INIT_ERROR' },
		})

		const executor = initiateStateWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: {} })

		// Verify error handling
		expect(mockCreateErrorResult).toHaveBeenCalledWith('Failed to initialize state')
		expect(result).toEqual(
			expect.objectContaining({
				isError: true,
				content: expect.arrayContaining([
					expect.objectContaining({
						type: 'text',
						text: expect.stringContaining('Failed to initialize state'),
					}),
				]),
			}),
		)
	})

	test('should handle unexpected errors during execution', async () => {
		// Mock that there is no active wizard
		mockIsActive.mockReturnValue(false)
		mockInitializeState.mockImplementation(() => {
			throw new Error('Unexpected error during initialization')
		})

		const executor = initiateStateWizardToolExecutor(mockStateManager)
		const result = await executor({ arguments: {} })

		// Verify error handling
		expect(mockCreateErrorResult).toHaveBeenCalledWith('Unexpected error during initialization')
		expect(result).toEqual(
			expect.objectContaining({
				isError: true,
				content: expect.arrayContaining([
					expect.objectContaining({
						type: 'text',
						text: expect.stringContaining('Unexpected error during initialization'),
					}),
				]),
			}),
		)
	})
})
