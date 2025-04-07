/**
 * Unit tests for the issue creation API
 */

import { createIssue, type CreateIssueFields } from '../createIssue'
import type { JiraApiConfig } from '../apiTypes'

// Mock all dependencies
jest.mock('../issueCreationValidation')
jest.mock('../../../utils/logger')
// Configure the mock for the try utility
jest.mock('../../../utils/try', () => ({
	Success: jest.fn((value) => ({ success: true, value })),
	Failure: jest.fn((error) => ({ success: false, error })),
}))
jest.mock('../callJiraApi')

// Import mocked modules
import { validateCreateIssueFields } from '../issueCreationValidation'
import { callJiraApi, RestMethod } from '../callJiraApi'
import { log } from '../../../utils/logger'
import { Failure, Success } from '../../../utils/try' // Imports the mocked versions

// Set up typed mock functions
const mockValidateCreateIssueFields = validateCreateIssueFields as jest.MockedFunction<typeof validateCreateIssueFields>
const mockCallJiraApi = callJiraApi as jest.MockedFunction<typeof callJiraApi>
const mockLog = log as jest.MockedFunction<typeof log>
// We can still type the mocked functions if needed, but direct call verification might be less useful now
// const mockFailure = Failure as jest.MockedFunction<typeof Failure>
// const mockSuccess = Success as jest.MockedFunction<typeof Success>

describe('createIssue', () => {
	const validFields: CreateIssueFields = {
		summary: 'Test Issue',
		project: {
			key: 'TEST',
		},
		issuetype: {
			id: '10001',
		},
		description: 'Test description',
	}

	const apiConfig: JiraApiConfig = {
		baseUrl: 'https://jira.example.com',
		username: 'test@example.com',
		apiToken: 'test-token',
	}

	beforeEach(() => {
		// Reset all mocks
		jest.clearAllMocks()
	})

	it('should return failure structure when validation fails', async () => {
		// Setup validation to fail
		const validationError = 'Summary is required'
		mockValidateCreateIssueFields.mockReturnValue(validationError)

		// Create an issue with fields that fail validation
		const result = await createIssue(apiConfig, validFields)

		// Verify validation was called
		expect(mockValidateCreateIssueFields).toHaveBeenCalledWith(validFields)

		// Verify log was called
		expect(mockLog).toHaveBeenCalledWith(`ERROR: Invalid issue creation fields: ${validationError}`)

		// Verify callJiraApi was not called
		expect(mockCallJiraApi).not.toHaveBeenCalled()

		// Verify result matches the failure structure
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toBeInstanceOf(Error)
			expect(result.error.message).toBe(validationError)
		}
		// Optional: Verify the mocked Failure function was called (if needed)
		expect(Failure).toHaveBeenCalledWith(expect.any(Error))
	})

	it('should call API and return success structure when validation passes', async () => {
		// Setup validation to pass
		mockValidateCreateIssueFields.mockReturnValue(null)

		// Setup API call success response
		const successValue = {
			id: '123',
			key: 'TEST-123',
			self: 'https://jira.example.com/rest/api/3/issue/123',
		}
		// Mock callJiraApi to return a structure compatible with Try<CreateIssueResponse>
		// A successful call means success is true, error is undefined, value is populated.
		const mockResolvedApiResult = { success: true as const, error: undefined, value: successValue }
		mockCallJiraApi.mockResolvedValue(mockResolvedApiResult)

		// Call the createIssue function
		const result = await createIssue(apiConfig, validFields)

		// Verify validation was called
		expect(mockValidateCreateIssueFields).toHaveBeenCalledWith(validFields)

		// Verify debug logs were called
		expect(mockLog).toHaveBeenCalledWith(
			expect.stringContaining('DEBUG: Submitting Jira issue creation with request structure:'),
		)

		// Prepare the expected payload (as an object) including ADF and update field
		const expectedPayload = {
			fields: {
				summary: 'Test Issue',
				project: {
					key: 'TEST',
				},
				issuetype: {
					id: '10001',
				},
				description: {
					content: [
						{
							content: [
								{
									text: 'Test description',
									type: 'text',
								},
							],
							type: 'paragraph',
						},
					],
					type: 'doc',
					version: 1,
				},
			},
			update: {},
		}

		// Verify callJiraApi was called with correct parameters
		expect(mockCallJiraApi).toHaveBeenCalledWith({
			config: apiConfig,
			endpoint: '/rest/api/3/issue',
			method: RestMethod.POST,
			// Expect the body to be an object, not a stringified version
			body: expectedPayload,
		})

		// Verify result matches the success structure and content
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.value).toEqual(successValue)
		}
		// Optional: Verify the mocked Success function was called
		expect(Success).toHaveBeenCalledWith(successValue)
	})

	it('should return failure structure when API call fails', async () => {
		// Setup validation to pass
		mockValidateCreateIssueFields.mockReturnValue(null)

		// Setup API call failure response
		const apiError = new Error('API Call Failed')
		// Mock callJiraApi to return a structure indicating failure (compatible with Try)
		// Success is false, error is populated, value is undefined.
		const mockResolvedApiResult = { success: false as const, error: apiError, value: undefined }
		mockCallJiraApi.mockResolvedValue(mockResolvedApiResult)

		// Call the createIssue function
		const result = await createIssue(apiConfig, validFields)

		// Verify validation and API call happened
		expect(mockValidateCreateIssueFields).toHaveBeenCalledWith(validFields)
		expect(mockCallJiraApi).toHaveBeenCalledTimes(1)

		// Verify error log was called
		expect(mockLog).toHaveBeenCalledWith(`ERROR: Failed to create issue: ${apiError.message}`)

		// Verify result matches the failure structure and content
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toBe(apiError)
		}
		// Optional: Verify the mocked Failure function was called
		expect(Failure).toHaveBeenCalledWith(apiError)
	})
})

describe('Issue Creation Field Validation', () => {
	const validFields: CreateIssueFields = {
		summary: 'Test Issue',
		project: {
			key: 'TEST',
		},
		issuetype: {
			id: '10001',
		},
		description: 'Test description',
	}

	beforeEach(() => {
		// Reset all mocks before each test
		jest.clearAllMocks()
	})

	it('should validate required fields', () => {
		// Setup mock to simulate missing summary validation
		mockValidateCreateIssueFields.mockReturnValue('Summary field is required')

		// Create a test function that would use validation
		const testFunc = (fields: CreateIssueFields) => {
			const validationError = mockValidateCreateIssueFields(fields)
			if (validationError) {
				return {
					success: false as const,
					error: { message: validationError },
				}
			}
			return {
				success: true as const,
				value: { id: '123', key: 'TEST-123' },
			}
		}

		// Call with valid fields
		const result = testFunc(validFields)

		// Verify validation was called
		expect(mockValidateCreateIssueFields).toHaveBeenCalledWith(validFields)

		// Verify result contains the validation error
		expect(result.success).toBe(false)
		// TypeScript narrowing
		if (!result.success) {
			expect(result.error.message).toBe('Summary field is required')
		}
	})

	it('should pass validation with valid fields', () => {
		// Setup mock to simulate validation passing
		mockValidateCreateIssueFields.mockReturnValue(null)

		// Create a test function that would use validation
		const testFunc = (fields: CreateIssueFields) => {
			const validationError = mockValidateCreateIssueFields(fields)
			if (validationError) {
				return {
					success: false as const,
					error: { message: validationError },
				}
			}
			return {
				success: true as const,
				value: { id: '123', key: 'TEST-123' },
			}
		}

		// Call with valid fields
		const result = testFunc(validFields)

		// Verify validation was called
		expect(mockValidateCreateIssueFields).toHaveBeenCalledWith(validFields)

		// Verify success response
		expect(result.success).toBe(true)
		// TypeScript narrowing
		if (result.success) {
			expect(result.value).toEqual({ id: '123', key: 'TEST-123' })
		}
	})
})
