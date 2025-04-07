import { transformFieldsForPayload } from '../transformFieldsForPayload'
import type { CreateIssueFields } from '../../createIssue'
import type { ADFDocument } from '../../../types/atlassianDocument.types'

const mockLogger = jest.fn()
const mockFormatDescFn = jest.fn()
const mockFormatUserFn = jest.fn()

describe('transformFieldsForPayload', () => {
	beforeEach(() => {
		// Reset mocks before each test
		mockLogger.mockClear()
		mockFormatDescFn.mockClear()
		mockFormatUserFn.mockClear()
	})

	it('should correctly transform standard fields and call formatters', () => {
		const inputFields: CreateIssueFields = {
			summary: 'Test Summary',
			project: { key: 'TEST' },
			issuetype: { id: '10001' },
			description: 'Test Description',
			reporter: { name: 'reporter.user' },
			assignee: { name: 'assignee.user' },
		}

		const mockAdf: ADFDocument = { type: 'doc', version: 1, content: [] }
		const mockReporter = { accountId: 'reporter-123' }
		const mockAssignee = { accountId: 'assignee-456' }

		mockFormatDescFn.mockReturnValue(mockAdf)
		// Mock implementation for formatUserFn based on input
		mockFormatUserFn.mockImplementation((user) => {
			if (user && typeof user === 'object' && 'name' in user) {
				if (user.name === 'reporter.user') return mockReporter
				if (user.name === 'assignee.user') return mockAssignee
			}
			return undefined
		})

		const result = transformFieldsForPayload(inputFields, mockLogger, mockFormatDescFn, mockFormatUserFn)

		expect(result.summary).toBe('Test Summary')
		expect(result.project).toEqual({ key: 'TEST' })
		expect(result.issuetype).toEqual({ id: '10001' })
		expect(result.description).toEqual(mockAdf)
		expect(result.reporter).toEqual(mockReporter)
		expect(result.assignee).toEqual(mockAssignee)
		expect(mockFormatDescFn).toHaveBeenCalledWith('Test Description')
		expect(mockFormatUserFn).toHaveBeenCalledWith({ name: 'reporter.user' }, 'Reporter', mockLogger)
		expect(mockFormatUserFn).toHaveBeenCalledWith({ name: 'assignee.user' }, 'Assignee', mockLogger)
		expect(mockLogger).not.toHaveBeenCalled() // Logger shouldn't be called for successful formats
	})

	it('should omit description, reporter, and assignee if formatters return undefined', () => {
		const inputFields: CreateIssueFields = {
			summary: 'Minimal Summary',
			project: { key: 'MIN' },
			issuetype: { id: '10002' },
			description: 'Invalid Description Data',
			reporter: { name: 'invalid.reporter' },
			assignee: { name: 'invalid.assignee' },
			customField_1001: 'should still be copied', // Arbitrary field
		}

		mockFormatDescFn.mockReturnValue(undefined)
		mockFormatUserFn.mockReturnValue(undefined) // Formatters fail for these inputs

		const result = transformFieldsForPayload(inputFields, mockLogger, mockFormatDescFn, mockFormatUserFn)

		expect(result.summary).toBe('Minimal Summary')
		expect(result.project).toEqual({ key: 'MIN' })
		expect(result.issuetype).toEqual({ id: '10002' })
		expect(result).not.toHaveProperty('description') // Should be omitted
		expect(result).not.toHaveProperty('reporter') // Should be omitted
		expect(result).not.toHaveProperty('assignee') // Should be omitted
		expect(result.customField_1001).toBe('should still be copied') // Arbitrary field copied
		expect(mockFormatDescFn).toHaveBeenCalledWith('Invalid Description Data')
		expect(mockFormatUserFn).toHaveBeenCalledWith({ name: 'invalid.reporter' }, 'Reporter', mockLogger)
		expect(mockFormatUserFn).toHaveBeenCalledWith({ name: 'invalid.assignee' }, 'Assignee', mockLogger)
	})

	it('should copy arbitrary own properties using copyArbitraryFields', () => {
		const inputFields: CreateIssueFields = {
			summary: 'Summary with Custom Fields',
			project: { key: 'CUSTOM' },
			issuetype: { id: '10003' },
			customField_1000: 'Value 1',
			another_custom: { complex: true, value: 123 },
		}

		mockFormatDescFn.mockReturnValue(undefined) // No description
		mockFormatUserFn.mockReturnValue(undefined) // No reporter/assignee

		const result = transformFieldsForPayload(inputFields, mockLogger, mockFormatDescFn, mockFormatUserFn)

		expect(result.summary).toBe('Summary with Custom Fields')
		expect(result.project).toEqual({ key: 'CUSTOM' })
		expect(result.issuetype).toEqual({ id: '10003' })
		expect(result.customField_1000).toBe('Value 1') // Copied
		expect(result.another_custom).toEqual({ complex: true, value: 123 }) // Copied
		expect(result).not.toHaveProperty('description')
		expect(result).not.toHaveProperty('reporter')
		expect(result).not.toHaveProperty('assignee')
	})

	it('should copy arbitrary own properties and ignore inherited properties', () => {
		// Create a prototype with an inherited property
		const proto = { inheritedField: 'I should not be copied' }
		// Create an object inheriting from the prototype
		const sourceFieldsWithInheritance = Object.create(proto)

		// Add own properties
		sourceFieldsWithInheritance.summary = 'Inheritance Test'
		sourceFieldsWithInheritance.project = { key: 'INH' }
		sourceFieldsWithInheritance.issuetype = { id: '10004' }
		sourceFieldsWithInheritance.ownCustomField = 'I should be copied'

		mockFormatDescFn.mockReturnValue(undefined)
		mockFormatUserFn.mockReturnValue(undefined)

		const result = transformFieldsForPayload(
			sourceFieldsWithInheritance,
			mockLogger,
			mockFormatDescFn,
			mockFormatUserFn,
		)

		expect(result.summary).toBe('Inheritance Test')
		expect(result.project).toEqual({ key: 'INH' })
		expect(result.issuetype).toEqual({ id: '10004' })
		expect(result.ownCustomField).toBe('I should be copied') // Own property copied
		expect(result).not.toHaveProperty('inheritedField') // Inherited property ignored
		expect(result).not.toHaveProperty('description')
		expect(result).not.toHaveProperty('reporter')
		expect(result).not.toHaveProperty('assignee')
	})
})
