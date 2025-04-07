/**
 * Tests for Jira GET Tool Executor
 *
 * This module contains tests for the executeJiraGetTool function
 * that implements the core logic for the Generic Jira GET tool.
 */

import { callJiraApi, RestMethod } from '../../../../../jira/api/callJiraApi'
import { log } from '../../../../../utils/logger'
import { Success, Failure } from '../../../../../utils/try'
import { extractEndpoint, validateEndpoint, extractQueryParams } from '../parameterUtils'
import { buildQueryString } from '../queryStringUtils'
import { executeJiraGetTool } from '../toolExecutor'

// Mock all dependencies
jest.mock('../../../../../jira/api/callJiraApi')
jest.mock('../parameterUtils')
jest.mock('../queryStringUtils')
jest.mock('../../../../../utils/logger')

// Mock function implementations
const mockedCallJiraApi = jest.mocked(callJiraApi)
const mockedExtractEndpoint = jest.mocked(extractEndpoint)
const mockedValidateEndpoint = jest.mocked(validateEndpoint)
const mockedExtractQueryParams = jest.mocked(extractQueryParams)
const mockedBuildQueryString = jest.mocked(buildQueryString)
const mockedLog = jest.mocked(log)

describe('Jira GET Tool Executor', () => {
	// Mock the Jira API configuration
	const mockJiraConfig = {
		baseUrl: 'https://example.atlassian.net',
		username: 'test-user',
		apiToken: 'test-token',
	}

	// Reset all mocks before each test
	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe('executeJiraGetTool', () => {
		it('should return an error when endpoint parameter is missing', async () => {
			// Mock the extractEndpoint to return null (no endpoint)
			mockedExtractEndpoint.mockReturnValue(null)

			const result = await executeJiraGetTool({}, mockJiraConfig)

			expect(result.isError).toBe(true)
			expect(result.content[0].text).toContain('Missing or invalid endpoint parameter')
			expect(mockedLog).toHaveBeenCalledWith(expect.stringContaining('ERROR'))
		})

		it('should return an error when endpoint format is invalid', async () => {
			// Mock the functions
			mockedExtractEndpoint.mockReturnValue('invalid-endpoint')
			mockedValidateEndpoint.mockReturnValue(false)

			const result = await executeJiraGetTool({ endpoint: 'invalid-endpoint' }, mockJiraConfig)

			expect(result.isError).toBe(true)
			expect(result.content[0].text).toContain('Invalid endpoint format')
			expect(mockedValidateEndpoint).toHaveBeenCalledWith('invalid-endpoint')
		})

		it('should make API call with correct parameters and return success result', async () => {
			// Mock the functions
			mockedExtractEndpoint.mockReturnValue('/rest/api/3/issue/TEST-123')
			mockedValidateEndpoint.mockReturnValue(true)
			mockedExtractQueryParams.mockReturnValue({ expand: 'changelog' })
			mockedBuildQueryString.mockReturnValue('?expand=changelog')

			// Mock the API call
			const responseData = { id: 'TEST-123', key: 'TEST-123', fields: {} }
			const successResponse = Success(responseData)
			mockedCallJiraApi.mockResolvedValue(successResponse)

			const result = await executeJiraGetTool(
				{ endpoint: '/rest/api/3/issue/TEST-123', queryParams: { expand: 'changelog' } },
				mockJiraConfig,
			)

			// Verify the API call was made with correct parameters
			expect(mockedCallJiraApi).toHaveBeenCalledWith({
				config: mockJiraConfig,
				endpoint: '/rest/api/3/issue/TEST-123?expand=changelog',
				method: RestMethod.GET,
			})

			// Verify the result
			expect(result.isError).toBeUndefined()
			const resultData = JSON.parse(result.content[0].text)
			expect(resultData.success).toBe(true)
			expect(resultData.value).toEqual(responseData)
		})

		it('should handle null query parameters gracefully', async () => {
			// Mock the functions
			mockedExtractEndpoint.mockReturnValue('/rest/api/3/issue/TEST-123')
			mockedValidateEndpoint.mockReturnValue(true)
			mockedExtractQueryParams.mockReturnValue(null)
			mockedBuildQueryString.mockReturnValue('')

			// Mock the API call
			const responseData = { id: 'TEST-123', key: 'TEST-123', fields: {} }
			const successResponse = Success(responseData)
			mockedCallJiraApi.mockResolvedValue(successResponse)

			const result = await executeJiraGetTool({ endpoint: '/rest/api/3/issue/TEST-123' }, mockJiraConfig)

			// Verify the API call was made with correct parameters
			expect(mockedCallJiraApi).toHaveBeenCalledWith({
				config: mockJiraConfig,
				endpoint: '/rest/api/3/issue/TEST-123',
				method: RestMethod.GET,
			})

			// Verify the result
			expect(result.isError).toBeUndefined()
			const resultData = JSON.parse(result.content[0].text)
			expect(resultData.success).toBe(true)
			expect(resultData.value).toEqual(responseData)

			// Verify buildQueryString was called with empty object when queryParams is null
			expect(mockedBuildQueryString).toHaveBeenCalledWith({})
		})

		it('should return error when API call fails', async () => {
			// Mock the functions
			mockedExtractEndpoint.mockReturnValue('/rest/api/3/issue/TEST-404')
			mockedValidateEndpoint.mockReturnValue(true)
			mockedExtractQueryParams.mockReturnValue({})
			mockedBuildQueryString.mockReturnValue('')

			// Mock the API call to return an error
			const apiError = new Error('Issue does not exist')
			const errorResponse = Failure(apiError)
			mockedCallJiraApi.mockResolvedValue(errorResponse)

			const result = await executeJiraGetTool({ endpoint: '/rest/api/3/issue/TEST-404' }, mockJiraConfig)

			// Verify the result indicates an error
			expect(result.isError).toBe(true)

			// Verify the error message is included in the response
			expect(result.content[0].text).toContain('error')

			// Parse the result and check the error properties without direct comparison
			const resultData = JSON.parse(result.content[0].text)
			expect(resultData.success).toBe(false)
			expect(typeof resultData.error).toBe('object')
		})
	})
})
