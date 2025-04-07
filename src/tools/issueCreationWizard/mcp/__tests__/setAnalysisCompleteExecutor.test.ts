/**
 * Tests for setAnalysisCompleteExecutor
 *
 * This file contains tests for the executor that sets the analysis complete flag.
 */

import { setAnalysisCompleteExecutor } from '../setAnalysisCompleteExecutor'
import * as setConfirmationFlags from '../../operations/setConfirmationFlags'
import type { StateManager } from '../../stateManager'
import type { ToolResult } from '../../../../types'

// Mock the operations from setConfirmationFlags
jest.mock('../../operations/setConfirmationFlags')

describe('setAnalysisCompleteExecutor', () => {
	let mockStateManager: jest.Mocked<StateManager>
	let mockParameters: { arguments: { isComplete: boolean } }
	let executorFn: ReturnType<typeof setAnalysisCompleteExecutor>

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
			arguments: { isComplete: true },
		}

		// Create spy for the setAnalysisComplete function
		jest.spyOn(setConfirmationFlags, 'setAnalysisComplete').mockImplementation(
			() =>
				({
					isError: false,
					content: [{ type: 'text', text: 'Success message' }],
				}) as unknown as ToolResult,
		)

		// Create the executor function
		executorFn = setAnalysisCompleteExecutor(mockStateManager)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should pass correct parameters to setAnalysisComplete', async () => {
		// Execute
		await executorFn(mockParameters as any)

		// Verify
		expect(setConfirmationFlags.setAnalysisComplete).toHaveBeenCalledWith(mockStateManager, { isComplete: true })
	})

	it('should return result from setAnalysisComplete', async () => {
		// Mock the return value
		const expectedResult = {
			isError: false,
			content: [{ type: 'text', text: 'Success message' }],
		}

		;(setConfirmationFlags.setAnalysisComplete as jest.Mock).mockReturnValue(expectedResult)

		// Execute
		const result = await executorFn(mockParameters as any)

		// Verify
		expect(result).toEqual(expectedResult)
	})

	it('should pass false flag when isComplete is false', async () => {
		// Setup
		mockParameters.arguments.isComplete = false

		// Execute
		await executorFn(mockParameters as any)

		// Verify
		expect(setConfirmationFlags.setAnalysisComplete).toHaveBeenCalledWith(mockStateManager, { isComplete: false })
	})
})
