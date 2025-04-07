import { log } from '../../../utils/logger'
import { Failure } from '../../../utils/try'
import { handleApiError } from '../apiUtils'

// Mock the logger
jest.mock('../../../utils/logger', () => ({
	log: jest.fn(),
}))

describe('API Utils', () => {
	beforeEach(() => {
		// Clear all mocks before each test
		jest.clearAllMocks()
	})

	describe('handleApiError', () => {
		it('should handle API error with non-empty error messages array', async () => {
			// Set up mock response
			const mockResponse = {
				status: 404,
				json: jest.fn().mockResolvedValue({
					errorMessages: ['Issue not found'],
				}),
			} as unknown as Response

			// Call the function
			const result = await handleApiError(mockResponse, 'Test context')

			// Verify logger was called with correct parameters
			expect(log).toHaveBeenCalled()

			// Verify the result
			expect(result).toEqual({
				success: false,
				error: new Error('Error: Issue not found, Status: 404'),
				value: undefined,
			})
		})

		it('should handle API error with empty error messages array', async () => {
			// Set up mock response with empty errorMessages array
			const mockResponse = {
				status: 400,
				json: jest.fn().mockResolvedValue({
					errorMessages: [],
				}),
			} as unknown as Response

			// Call the function
			const result = await handleApiError(mockResponse, 'Empty error messages')

			// Verify logger was called
			expect(log).toHaveBeenCalled()

			// Should use the default error message since array is empty
			expect(result).toEqual(Failure(new Error('Failed to fetch Jira issue. Status: 400')))
		})

		it('should handle API error with null error messages', async () => {
			// Set up mock response with null errorMessages
			const mockResponse = {
				status: 500,
				json: jest.fn().mockResolvedValue({
					errorMessages: null,
				}),
			} as unknown as Response

			// Call the function
			const result = await handleApiError(mockResponse, 'Null error messages')

			// Verify logger was called
			expect(log).toHaveBeenCalled()

			// Should use the default error message
			expect(result).toEqual(Failure(new Error('Failed to fetch Jira issue. Status: 500')))
		})

		it('should handle API error without error messages property', async () => {
			// Set up mock response without errorMessages property
			const mockResponse = {
				status: 500,
				json: jest.fn().mockResolvedValue({}),
			} as unknown as Response

			// Call the function
			const result = await handleApiError(mockResponse, 'No error messages property')

			// Verify logger was called
			expect(log).toHaveBeenCalled()

			// Should use the default error message
			expect(result).toEqual(Failure(new Error('Failed to fetch Jira issue. Status: 500')))
		})

		it('should handle API error with unexpected errorMessages type', async () => {
			// Set up mock response with errorMessages as string instead of array
			const mockResponse = {
				status: 403,
				json: jest.fn().mockResolvedValue({
					errorMessages: 'Not an array but a string',
				}),
			} as unknown as Response

			// Call the function
			const result = await handleApiError(mockResponse, 'Unexpected errorMessages type')

			// Verify logger was called
			expect(log).toHaveBeenCalled()

			// Should use the default error message since errorMessages is not an array
			expect(result).toEqual(Failure(new Error('Failed to fetch Jira issue. Status: 403')))
		})

		it('should handle API error with undefined errorMessages array', async () => {
			// Set up mock response with undefined errorMessages
			const mockResponse = {
				status: 401,
				json: jest.fn().mockResolvedValue({
					errorMessages: undefined,
				}),
			} as unknown as Response

			// Call the function
			const result = await handleApiError(mockResponse, 'Undefined error messages')

			// Verify logger was called
			expect(log).toHaveBeenCalled()

			// Should use the default error message
			expect(result).toEqual(Failure(new Error('Failed to fetch Jira issue. Status: 401')))
		})
	})
})
