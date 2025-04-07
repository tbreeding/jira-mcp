import { buildCreateIssuePayload } from '../createIssuePayload'
import type { CreateIssueFields } from '../createIssue'
import { log } from '../../../utils/logger' // Import default logger
import { formatDescriptionForAdf as defaultFormatAdf } from '../formatAdf' // Import default ADF formatter
import { formatUserField as defaultFormatUser } from '../formatUserField' // Import default user formatter

// Mock the core transformation utility using Jest
jest.mock('../utils/transformFieldsForPayload', () => ({
	transformFieldsForPayload: jest.fn(),
}))

// Mock default dependencies (can be overridden in tests) using Jest
jest.mock('../../../utils/logger', () => ({
	log: jest.fn(),
}))
jest.mock('../formatAdf', () => ({
	formatDescriptionForAdf: jest.fn(),
}))
jest.mock('../formatUserField', () => ({
	formatUserField: jest.fn(),
}))

// Access the mocked function for assertions
// Need to import AFTER mocking
import { transformFieldsForPayload } from '../utils/transformFieldsForPayload'

describe('buildCreateIssuePayload', () => {
	// Cast the imported function once for use in tests and beforeEach
	const mockedTransform = transformFieldsForPayload as jest.Mock

	beforeEach(() => {
		// Clear mock call history before each test
		mockedTransform.mockClear()
	})

	it('should call transformFieldsForPayload with default dependencies and return correct structure', () => {
		// Remove local casting, use the one from describe scope
		// const mockedTransform = transformFieldsForPayload as jest.Mock

		const mockFields: CreateIssueFields = {
			project: { key: 'TEST' },
			issuetype: { id: '10001' },
			summary: 'Test Summary',
			description: 'Test Description',
			assignee: { name: 'test.user' },
		}

		const expectedTransformedFields = {
			project: { key: 'TEST' },
			issuetype: { id: '10001' },
			summary: 'Test Summary',
			description: { type: 'doc', version: 1, content: [] }, // Mocked ADF
			assignee: { accountId: '12345' }, // Mocked formatted user
		}

		// Configure the mock transform function to return a specific value
		mockedTransform.mockReturnValue(expectedTransformedFields)

		const payload = buildCreateIssuePayload(mockFields)

		// Verify transformFieldsForPayload was called correctly
		expect(mockedTransform).toHaveBeenCalledTimes(1) // Use Jest's toHaveBeenCalledTimes
		expect(mockedTransform).toHaveBeenCalledWith(
			mockFields,
			log, // Expect default logger
			defaultFormatAdf, // Expect default ADF formatter
			defaultFormatUser, // Expect default user formatter
		)

		// Verify the structure of the returned payload
		expect(payload).toEqual({
			fields: expectedTransformedFields,
			update: {},
		})
	})

	it('should call transformFieldsForPayload with provided dependencies', () => {
		// Remove local casting, use the one from describe scope
		// const mockedTransform = transformFieldsForPayload as jest.Mock

		const mockFields: CreateIssueFields = {
			project: { key: 'PROJ' },
			issuetype: { id: '10000' },
			summary: 'Another Summary',
		}

		const mockLogger = jest.fn() // Use jest.fn()
		const mockFormatDesc = jest.fn().mockReturnValue(undefined) // Use jest.fn()
		const mockFormatUser = jest.fn().mockReturnValue({ accountId: 'custom' }) // Use jest.fn()
		const expectedTransformedFields = {
			project: { key: 'PROJ' },
			issuetype: { id: '10000' },
			summary: 'Another Summary',
		}

		mockedTransform.mockReturnValue(expectedTransformedFields)

		const payload = buildCreateIssuePayload(mockFields, mockLogger, mockFormatDesc, mockFormatUser)

		// Verify transformFieldsForPayload was called correctly with custom functions
		expect(mockedTransform).toHaveBeenCalledTimes(1) // Use Jest's toHaveBeenCalledTimes
		expect(mockedTransform).toHaveBeenCalledWith(mockFields, mockLogger, mockFormatDesc, mockFormatUser)

		// Verify the structure of the returned payload
		expect(payload).toEqual({
			fields: expectedTransformedFields,
			update: {},
		})
	})
})
