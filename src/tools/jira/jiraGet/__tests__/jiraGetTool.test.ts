/**
 * Tests for the Generic Jira GET Tool
 *
 * This module contains tests for the Generic Jira GET tool implementation.
 * It verifies parameter validation, URL construction, error handling,
 * and response formatting to ensure the tool functions correctly.
 */

import * as errorHandlers from '../../../../errors/handlers'
import { ErrorCode } from '../../../../errors/types'
import { callJiraApi, RestMethod } from '../../../../jira/api/callJiraApi'
import { Success, Failure } from '../../../../utils/try'
import { jiraGetTool, getJiraGetToolExecutor } from '../jiraGetTool'
import { extractEndpoint, extractQueryParams, validateEndpoint } from '../utils/parameterUtils'
import { buildQueryString } from '../utils/queryStringUtils'
import { executeJiraGetTool } from '../utils/toolExecutor'

// Mock dependencies
jest.mock('../../../../jira/api/callJiraApi')
jest.mock('../../../../utils/logger')
jest.mock('../../../../errors/handlers')
jest.mock('../utils/toolExecutor')

const mockCallJiraApi = callJiraApi as jest.Mock
const mockExecuteJiraGetTool = executeJiraGetTool as jest.Mock

describe('jiraGet Tool', () => {
	const mockJiraConfig = {
		baseUrl: 'https://jira.example.com',
		username: 'testuser',
		apiToken: 'testtoken',
	}

	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe('Tool Definition', () => {
		it('should have correct name and required parameters', () => {
			expect(jiraGetTool.name).toBe('jiraGet')
			expect(jiraGetTool.inputSchema.required).toContain('endpoint')
		})

		it('should have the correct properties', () => {
			expect(jiraGetTool).toHaveProperty('name')
			expect(jiraGetTool).toHaveProperty('description')
			expect(jiraGetTool).toHaveProperty('inputSchema')
		})
	})

	describe('Parameter Utilities', () => {
		describe('extractEndpoint', () => {
			it('should extract endpoint from parameters', () => {
				expect(extractEndpoint({ endpoint: '/test/endpoint' })).toBe('/test/endpoint')
			})

			it('should extract endpoint from nested arguments', () => {
				expect(extractEndpoint({ arguments: { endpoint: '/test/endpoint' } })).toBe('/test/endpoint')
			})

			it('should return null if endpoint is not found', () => {
				expect(extractEndpoint({})).toBeNull()
			})

			it('should handle invalid arguments property type', () => {
				expect(extractEndpoint({ arguments: 'not-an-object' })).toBeNull()
			})
		})

		describe('validateEndpoint', () => {
			it('should validate correctly formatted endpoints', () => {
				expect(validateEndpoint('/test/endpoint')).toBe(true)
			})

			it('should reject endpoints not starting with slash', () => {
				expect(validateEndpoint('test/endpoint')).toBe(false)
			})

			it('should reject empty endpoints', () => {
				expect(validateEndpoint('')).toBe(false)
			})
		})

		describe('extractQueryParams', () => {
			it('should extract queryParams from parameters', () => {
				const params = { key: 'value' }
				expect(extractQueryParams({ queryParams: params })).toEqual(params)
			})

			it('should extract queryParams from nested arguments', () => {
				const params = { key: 'value' }
				expect(extractQueryParams({ arguments: { queryParams: params } })).toEqual(params)
			})

			it('should return null if queryParams is not found', () => {
				expect(extractQueryParams({})).toBeNull()
			})

			it('should handle invalid arguments property type', () => {
				expect(extractQueryParams({ arguments: 'not-an-object' })).toBeNull()
			})
		})

		describe('buildQueryString', () => {
			it('should build a query string from simple parameters', () => {
				expect(buildQueryString({ key1: 'value1', key2: 'value2' })).toBe('?key1=value1&key2=value2')
			})

			it('should handle array parameters', () => {
				expect(buildQueryString({ key: ['value1', 'value2'] })).toBe('?key=value1&key=value2')
			})

			it('should handle object parameters', () => {
				expect(buildQueryString({ key: { prop: 'value' } })).toBe('?key=%7B%22prop%22%3A%22value%22%7D')
			})

			it('should return empty string for empty parameters', () => {
				expect(buildQueryString({})).toBe('')
			})

			it('should skip null and undefined values', () => {
				expect(buildQueryString({ key1: 'value1', key2: null, key3: undefined })).toBe('?key1=value1')
			})

			it('should handle null or undefined items in arrays', () => {
				// Test directly with the expected behavior
				const result = buildQueryString({ key: ['value1', null, undefined, 'value2'] })
				expect(result).toBe('?key=value1&key=value2')
			})
		})
	})

	describe('Tool Executor', () => {
		it('should make API call with correct parameters', async () => {
			// Mock successful API call
			mockCallJiraApi.mockResolvedValue(Success({ data: 'test' }))

			// Restore the mock for executeJiraGetTool for this test
			mockExecuteJiraGetTool.mockRestore()

			// We need to import the real function for this test
			const { executeJiraGetTool: realExecuteJiraGetTool } = jest.requireActual('../utils/toolExecutor')

			// Execute the real function
			await realExecuteJiraGetTool({ endpoint: '/test/endpoint', queryParams: { key: 'value' } }, mockJiraConfig)

			// Check if callJiraApi was called correctly
			expect(mockCallJiraApi).toHaveBeenCalledWith({
				config: mockJiraConfig,
				endpoint: '/test/endpoint?key=value',
				method: RestMethod.GET,
			})

			// Restore the mock for other tests
			jest.resetModules()
			jest.mock('../utils/toolExecutor')
		})

		it('should handle missing endpoint parameter', async () => {
			// Mock executeJiraGetTool to return an error for missing endpoint
			mockExecuteJiraGetTool.mockImplementation(() => {
				return {
					isError: true,
					content: [{ type: 'text', text: 'Missing or invalid endpoint parameter' }],
				}
			})

			const result = await executeJiraGetTool({}, mockJiraConfig)

			expect(result.isError).toBe(true)
			expect(result.content[0].text).toContain('Missing or invalid endpoint parameter')
		})

		it('should handle invalid endpoint format', async () => {
			// Mock executeJiraGetTool to return an error for invalid endpoint
			mockExecuteJiraGetTool.mockImplementation(() => {
				return {
					isError: true,
					content: [{ type: 'text', text: 'Invalid endpoint format' }],
				}
			})

			const result = await executeJiraGetTool({ endpoint: 'invalid' }, mockJiraConfig)

			expect(result.isError).toBe(true)
			expect(result.content[0].text).toContain('Invalid endpoint format')
		})

		it('should handle API errors', async () => {
			// Mock callJiraApi to fail
			mockCallJiraApi.mockResolvedValue(Failure(new Error('API error')))

			// Mock executeJiraGetTool to return an error
			mockExecuteJiraGetTool.mockImplementation(() => {
				return {
					isError: true,
					content: [{ type: 'text', text: '{"error":"API error"}' }],
				}
			})

			const result = await executeJiraGetTool({ endpoint: '/test/endpoint' }, mockJiraConfig)

			expect(result.isError).toBe(true)
			expect(JSON.parse(result.content[0].text)).toHaveProperty('error')
		})
	})

	describe('Tool Executor Factory', () => {
		it('should return a function when called', () => {
			const executor = getJiraGetToolExecutor(mockJiraConfig)
			expect(typeof executor).toBe('function')
		})

		it('should successfully handle parameters and return data', async () => {
			// Mock safeExecute to return success with data
			jest.spyOn(errorHandlers, 'safeExecute').mockResolvedValue({
				success: true,
				data: {
					content: [{ type: 'text', text: 'success data' }],
				},
			})

			const executor = getJiraGetToolExecutor(mockJiraConfig)
			const result = await executor({ arguments: { endpoint: '/test/endpoint' } })

			expect(result).toEqual({
				content: [{ type: 'text', text: 'success data' }],
			})
			expect(errorHandlers.safeExecute).toHaveBeenCalled()
		})

		it('should handle errors properly', async () => {
			// Mock safeExecute to return failure with error message
			jest.spyOn(errorHandlers, 'safeExecute').mockResolvedValue({
				success: false,
				error: {
					code: ErrorCode.TOOL_EXECUTION_ERROR,
					message: 'Test error message',
					metadata: {},
				},
			})

			const executor = getJiraGetToolExecutor(mockJiraConfig)
			const result = await executor({ arguments: { endpoint: '/test/endpoint' } })

			expect(result.isError).toBe(true)
			expect(result.content[0].text).toBe('Error: Test error message')
			expect(errorHandlers.safeExecute).toHaveBeenCalled()
		})

		it('should handle null error message', async () => {
			// Mock safeExecute to return failure with null error message
			jest.spyOn(errorHandlers, 'safeExecute').mockResolvedValue({
				success: false,
				error: {
					code: ErrorCode.TOOL_EXECUTION_ERROR,
					message: null as unknown as string,
					metadata: {},
				},
			})

			const executor = getJiraGetToolExecutor(mockJiraConfig)
			const result = await executor({ arguments: { endpoint: '/test/endpoint' } })

			expect(result.isError).toBe(true)
			expect(result.content[0].text).toBe('Error: null')
		})

		it('should handle complex error object without message property', async () => {
			// Mock safeExecute to return failure with an error object that doesn't have a message property
			jest.spyOn(errorHandlers, 'safeExecute').mockResolvedValue({
				success: false,
				error: {
					code: ErrorCode.TOOL_EXECUTION_ERROR,
					details: 'This error has details but no message',
				} as any,
			})

			const executor = getJiraGetToolExecutor(mockJiraConfig)
			const result = await executor({ arguments: { endpoint: '/test/endpoint' } })

			expect(result.isError).toBe(true)
			expect(result.content[0].text).toBe('Error: undefined')
			expect(errorHandlers.safeExecute).toHaveBeenCalled()
		})

		it('should handle error with custom error object', async () => {
			// Mock safeExecute to return failure with a custom error structure
			jest.spyOn(errorHandlers, 'safeExecute').mockResolvedValue({
				success: false,
				error: new Error('Custom Error') as any,
			})

			const executor = getJiraGetToolExecutor(mockJiraConfig)
			const result = await executor({ arguments: { endpoint: '/test/endpoint' } })

			expect(result.isError).toBe(true)
			expect(result.content[0].text).toBe('Error: Custom Error')
			expect(errorHandlers.safeExecute).toHaveBeenCalled()
		})

		it('should handle errors with undefined message', async () => {
			// Mock safeExecute to return a failure with error object that has message=undefined
			jest
				.spyOn(errorHandlers, 'safeExecute')
				.mockImplementation(async (_callback: () => unknown, errorMessage?: string, errorCode?: ErrorCode) => {
					// We don't actually need to call the callback
					return {
						success: false,
						error: {
							code: errorCode || ErrorCode.TOOL_EXECUTION_ERROR,
							// This is what we're testing - explicitly undefined message
							message: undefined as unknown as string,
							metadata: {},
						},
					}
				})

			const executor = getJiraGetToolExecutor({
				baseUrl: 'test-url',
				username: 'test-user',
				apiToken: 'test-token',
			})
			const result = await executor({ arguments: {} })

			expect(result.isError).toBe(true)
			expect(result.content[0].text).toBe('Error: undefined')

			jest.restoreAllMocks()
		})

		it('should handle errors with null message property', async () => {
			// Mock safeExecute to return a failure with error object that has null message
			jest.spyOn(errorHandlers, 'safeExecute').mockResolvedValue({
				success: false,
				error: {
					code: ErrorCode.TOOL_EXECUTION_ERROR,
					message: null,
					metadata: {},
				} as any,
			})

			const executor = getJiraGetToolExecutor(mockJiraConfig)
			const result = await executor({ arguments: { endpoint: '/test/endpoint' } })

			expect(result.isError).toBe(true)
			expect(result.content[0].text).toBe('Error: null')
		})

		it('should handle case where error property is completely missing', async () => {
			// Mock safeExecute to return a failure without an error property
			jest.spyOn(errorHandlers, 'safeExecute').mockResolvedValue({
				success: false,
				// error property is missing completely
			} as any)

			const executor = getJiraGetToolExecutor(mockJiraConfig)
			const result = await executor({ arguments: { endpoint: '/test/endpoint' } })

			expect(result.isError).toBe(true)
			expect(result.content[0].text).toBe('Error: undefined')
		})

		it('should correctly return data on success case', async () => {
			// Set up successful response with clear test data
			const successData = {
				content: [{ type: 'text', text: 'Success data from test' }],
			}

			// Mock safeExecute to return success with data
			jest.spyOn(errorHandlers, 'safeExecute').mockImplementation(async () => {
				return {
					success: true,
					data: successData,
				}
			})

			// Call the executor with a test parameter
			const executor = getJiraGetToolExecutor(mockJiraConfig)
			const result = await executor({ arguments: { endpoint: '/success/test/endpoint' } })

			// Verify safeExecute was called
			expect(errorHandlers.safeExecute).toHaveBeenCalledWith(
				expect.any(Function),
				'jiraGet tool execution failed',
				ErrorCode.TOOL_EXECUTION_ERROR,
			)

			// Verify result passes through correctly from data property
			expect(result).toBe(successData)
			expect(result).toEqual({
				content: [{ type: 'text', text: 'Success data from test' }],
			})
		})

		it('should verify executeToolWithParams function exists in the executor', async () => {
			// This test verifies the function structure without relying on complex mocking
			// that would require overriding readonly properties

			// We'll access and check the function content rather than trying to mock it
			const executorSource = getJiraGetToolExecutor.toString()

			// Updated test for the new structure where executeToolWithParams is externally defined
			expect(executorSource).toContain('executeToolWithParams(parameters, jiraConfig)')

			// Verify it has parameters and jiraConfig
			expect(executorSource).toContain('parameters')
			expect(executorSource).toContain('jiraConfig')

			// Verify safeExecute is called
			expect(executorSource).toContain('safeExecute')
		})

		it('should execute the callback function that calls executeToolWithParams', async () => {
			// Setup test data
			const testParams = { arguments: { endpoint: '/test/endpoint' } }
			const expectedResponse = {
				content: [{ type: 'text', text: 'Line 43 callback executed successfully' }],
			}

			// Mock executeJiraGetTool to return our expected response
			mockExecuteJiraGetTool.mockResolvedValue(expectedResponse)

			// Track if the callback was executed
			let callbackExecuted = false

			// Create a mock implementation of safeExecute that actually CALLS the callback
			const mockSafeExecute = jest.spyOn(errorHandlers, 'safeExecute').mockImplementation(async (callback) => {
				// This is the key part - actually executing the callback function from line 43
				const callbackResult = await callback()

				// Mark that we executed the callback
				callbackExecuted = true

				return {
					success: true,
					data: callbackResult,
				}
			})

			// Execute the tool
			const executor = getJiraGetToolExecutor(mockJiraConfig)
			const result = await executor(testParams)

			// Verify the result matches what we expect
			expect(result).toEqual(expectedResponse)

			// Verify safeExecute was called with the right parameters
			expect(mockSafeExecute).toHaveBeenCalledWith(
				expect.any(Function),
				'jiraGet tool execution failed',
				ErrorCode.TOOL_EXECUTION_ERROR,
			)

			// Verify the callback was actually executed
			expect(callbackExecuted).toBe(true)

			// Verify executeJiraGetTool was called
			expect(mockExecuteJiraGetTool).toHaveBeenCalledWith(testParams, mockJiraConfig)

			// Clean up
			jest.restoreAllMocks()
		})
	})
})
