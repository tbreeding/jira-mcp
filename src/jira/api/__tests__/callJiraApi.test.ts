import { handleApiError } from '../apiUtils'
import { callJiraApi, RestMethod } from '../callJiraApi'
import type { JiraApiConfig } from '../apiTypes'
import { Failure } from '../../../utils/try'

jest.mock('../apiUtils')
jest.mock('../../../utils/logger', () => ({
	log: jest.fn(),
}))

// Mock global fetch
const mockFetchResponse = {
	ok: true,
	status: 200,
	statusText: 'OK',
	json: jest.fn(),
}

global.fetch = jest.fn().mockResolvedValue(mockFetchResponse)
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
const mockHandleApiError = handleApiError as jest.MockedFunction<typeof handleApiError>

describe('callJiraApi', () => {
	const mockConfig: JiraApiConfig = {
		baseUrl: 'https://jira.example.com',
		username: 'testuser',
		apiToken: 'test-token',
	}

	const mockEndpoint = 'rest/api/3/issue/TEST-123'
	const mockResponseData = { id: '123', key: 'TEST-123' }
	const expectedAuth = Buffer.from(`${mockConfig.username}:${mockConfig.apiToken}`).toString('base64')

	beforeEach(() => {
		jest.clearAllMocks()
		mockFetchResponse.json.mockResolvedValue(mockResponseData)
		mockFetchResponse.ok = true
		mockFetchResponse.status = 200
		mockFetchResponse.statusText = 'OK'

		// Mock the handleApiError function to return a Promise<Try<never>>
		mockHandleApiError.mockImplementation((response, message) =>
			Promise.resolve(Failure(new Error(`${message}: ${response.status} ${response.statusText}`))),
		)
	})

	test('should make a successful GET request', async () => {
		// Execute
		const result = await callJiraApi({
			config: mockConfig,
			endpoint: mockEndpoint,
			method: RestMethod.GET,
		})

		// Verify
		expect(mockFetch).toHaveBeenCalledWith(
			`${mockConfig.baseUrl}${mockEndpoint}`,
			expect.objectContaining({
				method: 'GET',
				headers: expect.objectContaining({
					Authorization: `Basic ${expectedAuth}`,
					Accept: 'application/json',
				}),
			}),
		)
		expect(result.success).toBe(true)
		expect(result.value).toEqual(mockResponseData)
	})

	test('should make a successful POST request with body', async () => {
		// Setup
		const mockBody = { summary: 'Test Issue', description: 'Test Description' }

		// Execute
		const result = await callJiraApi({
			config: mockConfig,
			endpoint: mockEndpoint,
			method: RestMethod.POST,
			body: mockBody,
		})

		// Verify
		expect(mockFetch).toHaveBeenCalledWith(
			`${mockConfig.baseUrl}${mockEndpoint}`,
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify(mockBody),
				headers: expect.objectContaining({
					Authorization: `Basic ${expectedAuth}`,
					Accept: 'application/json',
				}),
			}),
		)
		expect(result.success).toBe(true)
		expect(result.value).toEqual(mockResponseData)
	})

	test('should make a successful PUT request with body', async () => {
		// Setup
		const mockBody = { summary: 'Updated Test Issue' }

		// Execute
		const result = await callJiraApi({
			config: mockConfig,
			endpoint: mockEndpoint,
			method: RestMethod.PUT,
			body: mockBody,
		})

		// Verify
		expect(mockFetch).toHaveBeenCalledWith(
			`${mockConfig.baseUrl}${mockEndpoint}`,
			expect.objectContaining({
				method: 'PUT',
				body: JSON.stringify(mockBody),
				headers: expect.objectContaining({
					Authorization: `Basic ${expectedAuth}`,
				}),
			}),
		)
		expect(result.success).toBe(true)
		expect(result.value).toEqual(mockResponseData)
	})

	test('should not include body in GET requests even if provided', async () => {
		// Setup
		const mockBody = { someParam: 'value' }

		// Execute
		await callJiraApi({
			config: mockConfig,
			endpoint: mockEndpoint,
			method: RestMethod.GET,
			body: mockBody,
		})

		// Verify
		expect(mockFetch).toHaveBeenCalledWith(
			`${mockConfig.baseUrl}${mockEndpoint}`,
			expect.objectContaining({
				method: 'GET',
				headers: expect.any(Object),
			}),
		)

		// Check that body is not included
		const fetchCallArg = mockFetch.mock.calls[0][1]
		expect(fetchCallArg).not.toHaveProperty('body')
	})

	test('should handle non-ok responses by calling handleApiError', async () => {
		// Setup
		mockFetchResponse.ok = false
		mockFetchResponse.status = 404
		mockFetchResponse.statusText = 'Not Found'

		const mockError = new Error('Failed to GET rest/api/3/issue/TEST-123: 404 Not Found')
		mockHandleApiError.mockResolvedValue(Failure(mockError))

		// Execute
		const result = await callJiraApi({
			config: mockConfig,
			endpoint: mockEndpoint,
			method: RestMethod.GET,
		})

		// Verify
		expect(mockHandleApiError).toHaveBeenCalledWith(mockFetchResponse, 'Failed to GET rest/api/3/issue/TEST-123')
		expect(result.success).toBe(false)
		expect(result.error).toEqual(mockError)
	})

	test('should handle network errors', async () => {
		// Setup
		const networkError = new Error('Network error')
		mockFetch.mockRejectedValueOnce(networkError)

		// Execute
		const result = await callJiraApi({
			config: mockConfig,
			endpoint: mockEndpoint,
			method: RestMethod.GET,
		})

		// Verify
		expect(result.success).toBe(false)
		expect(result.error).toEqual(networkError)
	})

	test('should handle JSON parsing errors', async () => {
		// Setup
		const jsonError = new Error('Invalid JSON')
		mockFetchResponse.json.mockRejectedValueOnce(jsonError)

		// Execute
		const result = await callJiraApi({
			config: mockConfig,
			endpoint: mockEndpoint,
			method: RestMethod.GET,
		})

		// Verify
		expect(result.success).toBe(false)
		expect(result.error).toEqual(jsonError)
	})
})
