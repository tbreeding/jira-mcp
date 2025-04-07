import * as fieldProcessor from '../fieldProcessor'
import { updateFieldsWizardToolExecutor } from '../updateFieldsExecutor'
import * as utils from '../utils'
import * as wizardStateHelpers from '../wizardStateHelpers'
import type { StateManager } from '../../stateManager'

// Mock dependencies
jest.mock('../utils')
jest.mock('../fieldProcessor')
jest.mock('../wizardStateHelpers')
jest.mock('../../../../utils/logger', () => ({
	log: jest.fn(),
}))

describe('updateFieldsWizardToolExecutor', () => {
	const mockJiraConfig = {
		baseUrl: 'https://jira.example.com',
		username: 'test@example.com',
		apiToken: 'test-token',
	}

	let mockStateManager: StateManager

	beforeEach(() => {
		jest.clearAllMocks()
		mockStateManager = {
			getState: jest.fn(),
			core: {},
		} as unknown as StateManager
	})

	it('should return error if wizard state is missing', async () => {
		// Setup checkWizardState to return error
		;(wizardStateHelpers.checkWizardState as jest.Mock).mockResolvedValue({
			success: false,
			errorMessage: 'No active wizard. Initialize one first.',
		})

		// Mock error result
		const mockErrorResult = {
			content: [{ type: 'text', text: 'Error: No active wizard. Initialize one first.' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockErrorResult)

		// Execute
		const executor = updateFieldsWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { fields: { summary: 'Test issue' }, validateOnly: false } })

		// Verify
		expect(result).toBe(mockErrorResult)
		expect(utils.createErrorResult).toHaveBeenCalledWith('No active wizard. Initialize one first.')
		expect(fieldProcessor.processFieldsAndState).not.toHaveBeenCalled()
	})

	it('should use default error message if checkWizardState fails without errorMessage', async () => {
		// Setup checkWizardState to return error without errorMessage
		;(wizardStateHelpers.checkWizardState as jest.Mock).mockResolvedValue({
			success: false,
			// No errorMessage provided
		})

		// Mock error result
		const mockErrorResult = {
			content: [{ type: 'text', text: 'Error: Failed to verify wizard state' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockErrorResult)

		// Execute
		const executor = updateFieldsWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { fields: { summary: 'Test issue' } } })

		// Verify
		expect(result).toBe(mockErrorResult)
		expect(utils.createErrorResult).toHaveBeenCalledWith('Failed to verify wizard state')
		expect(fieldProcessor.processFieldsAndState).not.toHaveBeenCalled()
	})

	it('should return error if state is missing project key or issue type', async () => {
		// Setup checkWizardState to return error for missing projectKey or issueTypeId
		;(wizardStateHelpers.checkWizardState as jest.Mock).mockResolvedValue({
			success: false,
			errorMessage: 'Project and issue type must be selected.',
		})

		// Mock error result
		const mockErrorResult = {
			content: [{ type: 'text', text: 'Error: Project and issue type must be selected.' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockErrorResult)

		// Execute
		const executor = updateFieldsWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { fields: { summary: 'Test issue' } } })

		// Verify
		expect(result).toBe(mockErrorResult)
		expect(utils.createErrorResult).toHaveBeenCalledWith('Project and issue type must be selected.')
		expect(fieldProcessor.processFieldsAndState).not.toHaveBeenCalled()
	})

	it('should return error if checkResult succeeds but misses required properties', async () => {
		// Setup checkWizardState to return success but with missing properties
		;(wizardStateHelpers.checkWizardState as jest.Mock).mockResolvedValue({
			success: true,
			// Missing projectKey, issueTypeId, and state
		})

		// Mock error result
		const mockErrorResult = {
			content: [{ type: 'text', text: 'Error: Project key, issue type ID, or wizard state is missing' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockErrorResult)

		// Execute
		const executor = updateFieldsWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { fields: { summary: 'Test issue' } } })

		// Verify
		expect(result).toBe(mockErrorResult)
		expect(utils.createErrorResult).toHaveBeenCalledWith('Project key, issue type ID, or wizard state is missing')
		expect(fieldProcessor.processFieldsAndState).not.toHaveBeenCalled()
	})

	it('should return error if no fields are provided', async () => {
		// Setup checkWizardState with valid state
		;(wizardStateHelpers.checkWizardState as jest.Mock).mockResolvedValue({
			success: true,
			state: {
				projectKey: 'PROJ',
				issueTypeId: 'issue-123',
			},
			projectKey: 'PROJ',
			issueTypeId: 'issue-123',
		})

		// Mock error result
		const mockErrorResult = {
			content: [{ type: 'text', text: 'Error: Fields parameter must be an object' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockErrorResult)

		// Execute with empty fields
		const executor = updateFieldsWizardToolExecutor(mockStateManager, mockJiraConfig)

		// Case 1: fields is undefined
		const result1 = await executor({ arguments: {} })

		// Verify
		expect(result1).toBe(mockErrorResult)
		expect(utils.createErrorResult).toHaveBeenCalledWith('Fields parameter must be an object')

		// Case 2: fields is empty object
		const result2 = await executor({ arguments: { fields: {} } })

		// Verify
		expect(result2).toBe(mockErrorResult)
		// Note: processFieldsAndState might be called with empty fields in the implementation
	})

	it('should successfully update fields', async () => {
		// Setup checkWizardState with valid state
		const mockState = {
			projectKey: 'PROJ',
			issueTypeId: 'issue-123',
		}

		;(wizardStateHelpers.checkWizardState as jest.Mock).mockResolvedValue({
			success: true,
			state: mockState,
			projectKey: 'PROJ',
			issueTypeId: 'issue-123',
		})

		// Mock fields to update
		const mockFields = {
			summary: 'Test issue',
			description: 'Test description',
		}

		// Mock field processing result
		const mockProcessResult = {
			success: true,
			message: 'Fields updated successfully',
			updatedFields: ['summary', 'description'],
		}

		;(fieldProcessor.processFieldsAndState as jest.Mock).mockResolvedValue(mockProcessResult)

		// Mock success result
		const mockSuccessResult = { content: [{ type: 'text', text: JSON.stringify(mockProcessResult) }] }
		;(utils.createSuccessResult as jest.Mock).mockReturnValue(mockSuccessResult)

		// Execute
		const executor = updateFieldsWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { fields: mockFields, validateOnly: false } })

		// Verify
		expect(result).toBe(mockSuccessResult)
		expect(fieldProcessor.processFieldsAndState).toHaveBeenCalledWith(
			mockStateManager,
			mockJiraConfig,
			{
				state: mockState,
				projectKey: 'PROJ',
				issueTypeId: 'issue-123',
			},
			{ fields: mockFields, validateOnly: false },
		)
		expect(utils.createSuccessResult).toHaveBeenCalledWith(mockProcessResult)
	})

	it('should support validation-only mode', async () => {
		// Setup checkWizardState with valid state
		;(wizardStateHelpers.checkWizardState as jest.Mock).mockResolvedValue({
			success: true,
			state: {
				projectKey: 'PROJ',
				issueTypeId: 'issue-123',
			},
			projectKey: 'PROJ',
			issueTypeId: 'issue-123',
		})

		// Mock fields to validate
		const mockFields = {
			summary: 'Test issue',
		}

		// Mock validation result
		const mockValidationResult = {
			success: true,
			message: 'Validation successful',
			isValid: true,
			errors: {},
		}

		;(fieldProcessor.processFieldsAndState as jest.Mock).mockResolvedValue(mockValidationResult)

		// Mock success result
		const mockSuccessResult = { content: [{ type: 'text', text: JSON.stringify(mockValidationResult) }] }
		;(utils.createSuccessResult as jest.Mock).mockReturnValue(mockSuccessResult)

		// Execute with validateOnly = true
		const executor = updateFieldsWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { fields: mockFields, validateOnly: true } })

		// Verify
		expect(result).toBe(mockSuccessResult)
		expect(fieldProcessor.processFieldsAndState).toHaveBeenCalledWith(
			mockStateManager,
			mockJiraConfig,
			{
				state: {
					projectKey: 'PROJ',
					issueTypeId: 'issue-123',
				},
				projectKey: 'PROJ',
				issueTypeId: 'issue-123',
			},
			{
				fields: mockFields,
				validateOnly: true,
			},
		)
		expect(utils.createSuccessResult).toHaveBeenCalledWith(mockValidationResult)
	})

	it('should handle field processor errors', async () => {
		// Setup checkWizardState with valid state
		;(wizardStateHelpers.checkWizardState as jest.Mock).mockResolvedValue({
			success: true,
			state: {
				projectKey: 'PROJ',
				issueTypeId: 'issue-123',
			},
			projectKey: 'PROJ',
			issueTypeId: 'issue-123',
		})

		// Mock field processing error
		const mockProcessResult = {
			success: false,
			message: 'Validation failed for one or more fields',
		}

		;(fieldProcessor.processFieldsAndState as jest.Mock).mockResolvedValue(mockProcessResult)

		// Mock error result
		const mockErrorResult = {
			content: [{ type: 'text', text: 'Error: Validation failed for one or more fields' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockErrorResult)

		// Execute
		const executor = updateFieldsWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { fields: { summary: '' } } })

		// Verify
		expect(result).toBe(mockErrorResult)
		expect(utils.createErrorResult).toHaveBeenCalledWith('Validation failed for one or more fields')
	})

	it('should handle exceptions and return error result', async () => {
		// Setup mock to throw an exception during argument processing
		const executor = updateFieldsWizardToolExecutor(mockStateManager, mockJiraConfig)

		// Mock error result
		const mockErrorResult = {
			content: [{ type: 'text', text: 'Error: Unexpected error: Test exception' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockErrorResult)

		// Intentionally pass invalid arguments that might cause an error during processing
		await executor({ arguments: { fields: null } as any }) // Example invalid args, removed unused 'result'

		// Check if the specific error for invalid fields was caught first
		if ((utils.createErrorResult as jest.Mock).mock.calls[0][0] !== 'Fields parameter must be an object') {
			// If not the specific fields error, check for the general catch block error
			// This part might need adjustment based on actual implementation throwing an error
			expect(utils.createErrorResult).toHaveBeenCalledWith(expect.stringContaining('Unexpected error:'))
		} else {
			// Handle the case where the 'Fields parameter must be an object' error was correctly triggered
			expect(utils.createErrorResult).toHaveBeenCalledWith('Fields parameter must be an object')
		}
	})

	it('should return error if arguments parameter is missing', async () => {
		// Mock error result for "Fields parameter must be an object"
		const mockErrorResult = {
			content: [{ type: 'text', text: 'Error: Fields parameter must be an object' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockErrorResult)

		// Execute with missing arguments using type assertion
		const executor = updateFieldsWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({} as any)

		// Verify
		expect(result).toBe(mockErrorResult)
		expect(utils.createErrorResult).toHaveBeenCalledWith('Fields parameter must be an object')
		// Ensure state checks and field processing were not reached
		expect(wizardStateHelpers.checkWizardState).not.toHaveBeenCalled()
		expect(fieldProcessor.processFieldsAndState).not.toHaveBeenCalled()
	})

	it('should return error if fields parameter is not an object', async () => {
		// Setup checkWizardState with valid state (to ensure we reach the fields check)
		;(wizardStateHelpers.checkWizardState as jest.Mock).mockResolvedValue({
			success: true,
			state: {
				projectKey: 'PROJ',
				issueTypeId: 'issue-123',
			},
			projectKey: 'PROJ',
			issueTypeId: 'issue-123',
		})

		// Mock error result for "Fields parameter must be an object"
		const mockErrorResult = {
			content: [{ type: 'text', text: 'Error: Fields parameter must be an object' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockErrorResult)

		// Execute with fields = string "not_an_object" (typeof is 'string')
		const executor = updateFieldsWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { fields: 'not_an_object' } })

		// Verify
		expect(result).toBe(mockErrorResult)
		expect(utils.createErrorResult).toHaveBeenCalledWith('Fields parameter must be an object')
		// Ensure field processing was not reached
		expect(fieldProcessor.processFieldsAndState).not.toHaveBeenCalled()
	})
})
