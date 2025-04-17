import { transformFieldsForPayload } from '../transformFieldsForPayload'
import type { CreateIssueFields } from '../../createIssue'

// Add these mocks at the top
jest.mock('../../formatAdf', () => ({
	formatDescriptionForAdf: jest.fn(() => ({ type: 'doc', version: 1, content: [] })),
}))
jest.mock('../../formatUserField', () => ({
	formatUserField: jest.fn(() => ({ accountId: 'mock-account-id' })),
}))

const mockLogger = jest.fn()

describe('transformFieldsForPayload', () => {
	beforeEach(() => {
		mockLogger.mockClear()
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

		const result = transformFieldsForPayload(inputFields, mockLogger)

		expect(result.summary).toBe('Test Summary')
		expect(result.project).toEqual({ key: 'TEST' })
		expect(result.issuetype).toEqual({ id: '10001' })
		expect(result.description).toBeDefined()
		expect(result.reporter).toBeDefined()
		expect(result.assignee).toBeDefined()
	})

	it('should handle missing or undefined description, reporter, and assignee', () => {
		const inputFields: CreateIssueFields = {
			summary: 'Minimal Summary',
			project: { key: 'MIN' },
			issuetype: { id: '10002' },
			customField_1001: 'should still be copied',
		}

		const result = transformFieldsForPayload(inputFields, mockLogger)

		expect(result.summary).toBe('Minimal Summary')
		expect(result.project).toEqual({ key: 'MIN' })
		expect(result.issuetype).toEqual({ id: '10002' })
		expect(result.customField_1001).toBe('should still be copied')
	})

	it('should copy arbitrary own properties', () => {
		const inputFields: CreateIssueFields = {
			summary: 'Summary with Custom Fields',
			project: { key: 'CUSTOM' },
			issuetype: { id: '10003' },
			customField_1000: 'Value 1',
			another_custom: { complex: true, value: 123 },
		}

		const result = transformFieldsForPayload(inputFields, mockLogger)

		expect(result.summary).toBe('Summary with Custom Fields')
		expect(result.project).toEqual({ key: 'CUSTOM' })
		expect(result.issuetype).toEqual({ id: '10003' })
		expect(result.customField_1000).toBe('Value 1')
		expect(result.another_custom).toEqual({ complex: true, value: 123 })
	})

	it('should copy arbitrary own properties and ignore inherited properties', () => {
		const proto = { inheritedField: 'I should not be copied' }
		const sourceFieldsWithInheritance = Object.create(proto)
		sourceFieldsWithInheritance.summary = 'Inheritance Test'
		sourceFieldsWithInheritance.project = { key: 'INH' }
		sourceFieldsWithInheritance.issuetype = { id: '10004' }
		sourceFieldsWithInheritance.ownCustomField = 'I should be copied'

		const result = transformFieldsForPayload(sourceFieldsWithInheritance, mockLogger)

		expect(result.summary).toBe('Inheritance Test')
		expect(result.project).toEqual({ key: 'INH' })
		expect(result.issuetype).toEqual({ id: '10004' })
		expect(result.ownCustomField).toBe('I should be copied')
		expect(result).not.toHaveProperty('inheritedField')
	})

	it('should not transform description if already in ADF format (object)', () => {
		const adfDescription = { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [] }] }
		const inputFields: any = {
			summary: 'ADF Test',
			project: { key: 'ADF' },
			issuetype: { id: '10006' },
			description: adfDescription,
		}

		const { formatDescriptionForAdf } = require('../../formatAdf')
		formatDescriptionForAdf.mockClear()

		const result = transformFieldsForPayload(inputFields, mockLogger)

		expect(result.description).toBe(adfDescription)
		expect(formatDescriptionForAdf).not.toHaveBeenCalled()
	})
})
