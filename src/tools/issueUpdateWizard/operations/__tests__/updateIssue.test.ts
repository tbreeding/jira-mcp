import type { JiraApiConfig } from '../../../../jira/api/apiTypes'
import type { WizardState } from '../../../issueCreationWizard/types'
import { Success, Failure } from '../../../../utils/try'

// Mock dependencies
jest.mock('../../../../utils/logger', () => ({
	log: jest.fn(),
}))

// Mock callJiraApi
jest.mock('../../../../jira/api/callJiraApi')

// Import modules after mocking
import { updateIssue } from '../updateIssue'
import { callJiraApi, RestMethod } from '../../../../jira/api/callJiraApi'

// Set up typed mock function
const mockedCallJiraApi = callJiraApi as jest.MockedFunction<typeof callJiraApi>

describe('updateIssue', () => {
	let mockConfig: JiraApiConfig

	beforeEach(() => {
		// Clear mocks before each test
		jest.clearAllMocks()

		// Create mock config
		mockConfig = {} as JiraApiConfig

		// Reset mock implementation
		mockedCallJiraApi.mockReset()
	})

	it('should return failure when issueKey is missing', async () => {
		// Arrange
		const mockState = {
			fields: { summary: 'Test issue' },
		} as unknown as WizardState

		// Act
		const result = await updateIssue(mockState, mockConfig)

		// Assert
		expect(result.success).toBe(false)
		expect(result.error).not.toBeUndefined()
		if (result.error) {
			expect(result.error).toBeInstanceOf(Error)
			expect(result.error.message).toBe('Cannot update issue: No issue key provided')
		}
		expect(mockedCallJiraApi).not.toHaveBeenCalled()
	})

	it('should return failure when there are no fields to update', async () => {
		// Arrange
		const mockState = {
			issueKey: 'TEST-123',
			fields: {},
		} as unknown as WizardState

		// Act
		const result = await updateIssue(mockState, mockConfig)

		// Assert
		expect(result.success).toBe(false)
		expect(result.error).not.toBeUndefined()
		if (result.error) {
			expect(result.error).toBeInstanceOf(Error)
			expect(result.error.message).toBe('No fields to update')
		}
		expect(mockedCallJiraApi).not.toHaveBeenCalled()
	})

	it('should return failure when fields only contain null/undefined/empty values', async () => {
		// Arrange
		const mockState = {
			issueKey: 'TEST-123',
			fields: {
				summary: null,
				description: undefined,
				assignee: '',
			},
		} as unknown as WizardState

		// Act
		const result = await updateIssue(mockState, mockConfig)

		// Assert
		expect(result.success).toBe(false)
		expect(result.error).not.toBeUndefined()
		if (result.error) {
			expect(result.error).toBeInstanceOf(Error)
			expect(result.error.message).toBe('No fields to update')
		}
		expect(mockedCallJiraApi).not.toHaveBeenCalled()
	})

	it('should return success when API call succeeds', async () => {
		// Arrange
		const issueKey = 'TEST-123'
		const mockState = {
			issueKey,
			fields: { summary: 'Test issue' },
		} as unknown as WizardState

		const mockResponse = {
			id: '10001',
			key: issueKey,
			self: 'https://jira.example.com/rest/api/3/issue/10001',
		}

		mockedCallJiraApi.mockResolvedValue(Success(mockResponse))

		// Act
		const result = await updateIssue(mockState, mockConfig)

		// Assert
		expect(result.success).toBe(true)
		expect(result.value).toBe(issueKey)
		expect(mockedCallJiraApi).toHaveBeenCalledWith({
			config: mockConfig,
			endpoint: `/rest/api/3/issue/${issueKey}`,
			method: RestMethod.PUT,
			body: expect.objectContaining({
				fields: expect.objectContaining({
					summary: 'Test issue',
				}),
			}),
		})
	})

	it('should return failure when API call fails', async () => {
		// Arrange
		const issueKey = 'TEST-123'
		const mockState = {
			issueKey,
			fields: { summary: 'Test issue' },
		} as unknown as WizardState

		const mockError = new Error('API error')

		mockedCallJiraApi.mockResolvedValue(Failure(mockError))

		// Act
		const result = await updateIssue(mockState, mockConfig)

		// Assert
		expect(result.success).toBe(false)
		expect(result.error).toBe(mockError)
		expect(mockedCallJiraApi).toHaveBeenCalled()
	})

	it('should handle unexpected errors during API call', async () => {
		// Arrange
		const issueKey = 'TEST-123'
		const mockState = {
			issueKey,
			fields: { summary: 'Test issue' },
		} as unknown as WizardState

		const unexpectedError = new Error('Network error')
		mockedCallJiraApi.mockRejectedValue(unexpectedError)

		// Act
		const result = await updateIssue(mockState, mockConfig)

		// Assert
		expect(result.success).toBe(false)
		expect(result.error).toBe(unexpectedError)
	})

	it('should handle non-Error thrown objects', async () => {
		// Arrange
		const issueKey = 'TEST-123'
		const mockState = {
			issueKey,
			fields: { summary: 'Test issue' },
		} as unknown as WizardState

		const nonErrorObject = 'This is not an Error object'
		mockedCallJiraApi.mockRejectedValue(nonErrorObject)

		// Act
		const result = await updateIssue(mockState, mockConfig)

		// Assert
		expect(result.success).toBe(false)
		expect(result.error).not.toBeUndefined()
		if (result.error) {
			expect(result.error).toBeInstanceOf(Error)
			expect(result.error.message).toBe(nonErrorObject)
		}
	})

	it('should filter out null, undefined, and empty string values from fields', async () => {
		// Arrange
		const issueKey = 'TEST-123'
		const mockState = {
			issueKey,
			fields: {
				summary: 'Test issue',
				description: 'Description',
				assignee: null,
				priority: undefined,
				labels: '',
				components: ['Component1'],
			},
		} as unknown as WizardState

		mockedCallJiraApi.mockResolvedValue(Success({ key: issueKey }))

		// Act
		const result = await updateIssue(mockState, mockConfig)

		// Assert
		expect(result.success).toBe(true)
		expect(result.value).toBe(issueKey)
		// Expect description to be ADF, not a string
		const expectedFields = {
			summary: 'Test issue',
			description: expect.objectContaining({ type: 'doc', version: 1 }),
			components: ['Component1'],
		}
		expect(mockedCallJiraApi).toHaveBeenCalledWith(
			expect.objectContaining({
				body: {
					fields: expectedFields,
				},
			}),
		)
	})
})
