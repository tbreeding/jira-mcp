/**
 * Tests for the executeToolWithParams function
 *
 * This file contains tests specifically for the executeToolWithParams function
 * in the jiraGetTool module.
 */

import { executeToolWithParams } from '../jiraGetTool'
import * as toolExecutor from '../utils/toolExecutor'

// Mock the dependencies
jest.mock('../utils/toolExecutor')

describe('executeToolWithParams', () => {
	// Setup
	const mockJiraConfig = {
		baseUrl: 'https://test-jira.atlassian.net',
		username: 'test-user',
		apiToken: 'test-token',
	}

	beforeEach(() => {
		// Clear mock data before each test
		jest.clearAllMocks()
	})

	it('should call executeJiraGetTool with the correct parameters', async () => {
		// Setup mock response
		const mockResponse = {
			content: [{ type: 'text', text: 'Test data' }],
		}

		// Configure the mock implementation
		;(toolExecutor.executeJiraGetTool as jest.Mock).mockResolvedValue(mockResponse)

		// Test params
		const testParams = { endpoint: '/test/endpoint' }

		// Execute the function
		const result = await executeToolWithParams(testParams, mockJiraConfig)

		// Verify executeJiraGetTool was called with correct parameters
		expect(toolExecutor.executeJiraGetTool).toHaveBeenCalledWith(testParams, mockJiraConfig)

		// Verify the result is as expected
		expect(result).toEqual(mockResponse)
	})
})
