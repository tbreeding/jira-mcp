/**
 * Tests for setUserConfirmationExecutor
 *
 * This file contains tests for the executor that sets the user confirmation flag.
 */

import { setUserConfirmationExecutor } from '../setUserConfirmationExecutor'
import * as setConfirmationFlags from '../../operations/setConfirmationFlags'
import type { StateManager } from '../../stateManager'
import type { ToolResult } from '../../../../types'

// Mock the operations from setConfirmationFlags
jest.mock('../../operations/setConfirmationFlags')

describe('setUserConfirmationExecutor', () => {
	let mockStateManager: jest.Mocked<StateManager>
	let mockParameters: { arguments: { confirmed: boolean } }
	let executorFn: ReturnType<typeof setUserConfirmationExecutor>

	beforeEach(() => {
		// Create mock state manager
		mockStateManager = {
			getState: jest.fn(),
			updateState: jest.fn(),
			isActive: jest.fn(),
			initializeState: jest.fn(),
			resetState: jest.fn(),
			serializeState: jest.fn(),
			deserializeState: jest.fn(),
			core: {},
		} as unknown as jest.Mocked<StateManager>

		// Create mock parameters
		mockParameters = {
			arguments: { confirmed: true },
		}

		// Create spy for the setUserConfirmation function
		jest.spyOn(setConfirmationFlags, 'setUserConfirmation').mockImplementation(
			() =>
				({
					isError: false,
					content: [{ type: 'text', text: 'Success message' }],
				}) as unknown as ToolResult,
		)

		// Create the executor function
		executorFn = setUserConfirmationExecutor(mockStateManager)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should pass correct parameters to setUserConfirmation', async () => {
		// Execute
		await executorFn(mockParameters as any)

		// Verify
		expect(setConfirmationFlags.setUserConfirmation).toHaveBeenCalledWith(mockStateManager, { confirmed: true })
	})

	it('should return result from setUserConfirmation', async () => {
		// Mock the return value
		const expectedResult = {
			isError: false,
			content: [{ type: 'text', text: 'Success message' }],
		}

		;(setConfirmationFlags.setUserConfirmation as jest.Mock).mockReturnValue(expectedResult)

		// Execute
		const result = await executorFn(mockParameters as any)

		// Verify
		expect(result).toEqual(expectedResult)
	})

	it('should pass false flag when confirmed is false', async () => {
		// Setup
		mockParameters.arguments.confirmed = false

		// Execute
		await executorFn(mockParameters as any)

		// Verify
		expect(setConfirmationFlags.setUserConfirmation).toHaveBeenCalledWith(mockStateManager, { confirmed: false })
	})
})
