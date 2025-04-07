import { extractTextFromDescription, extractTextFromADF, extractTextFromNode } from '../extractTextFromDescription'
import type { ADFDocument } from '../../../../../../types/atlassianDocument.types'
import type { JiraIssue, DescriptionContentNode } from '../../../../../../types/issue.types'

// Directly access the private isADFDocument function for testing
const isADFDocument = (obj: unknown): boolean => {
	if (!obj || typeof obj !== 'object') {
		return false
	}
	const possibleADF = obj as Record<string, unknown>
	return !!possibleADF.content && Array.isArray(possibleADF.content)
}

describe('isADFDocument', () => {
	it('should correctly identify ADF documents', () => {
		const validADF = {
			type: 'doc',
			version: 1,
			content: [],
		}

		expect(isADFDocument(validADF)).toBe(true)
	})

	it('should return false for null values', () => {
		expect(isADFDocument(null)).toBe(false)
	})

	it('should return false for undefined values', () => {
		expect(isADFDocument(undefined)).toBe(false)
	})

	it('should return false for primitive values', () => {
		expect(isADFDocument('')).toBe(false)
		expect(isADFDocument(0)).toBe(false)
		expect(isADFDocument(false)).toBe(false)
	})

	it('should return false for objects without content property', () => {
		const invalidADF = {
			type: 'doc',
			version: 1,
		}

		expect(isADFDocument(invalidADF)).toBe(false)
	})

	it('should return false for objects with null content', () => {
		const invalidADF = {
			type: 'doc',
			version: 1,
			content: null,
		} as unknown as any

		expect(isADFDocument(invalidADF)).toBe(false)
	})

	it('should return false for objects with non-array content', () => {
		const invalidADF = {
			type: 'doc',
			version: 1,
			content: 'not an array',
		} as unknown as any

		expect(isADFDocument(invalidADF)).toBe(false)
	})
})

describe('extractTextFromDescription', () => {
	it('should extract text from string description', () => {
		const issue = {
			fields: {
				description: 'This is a description with **formatting**',
			},
		} as JiraIssue

		const result = extractTextFromDescription(issue)
		expect(result).toBe('This is a description with **formatting**')
	})

	it('should extract text from ADF description', () => {
		const issue = {
			fields: {
				description: {
					type: 'doc',
					version: 1,
					content: [
						{
							type: 'paragraph',
							content: [
								{
									type: 'text',
									text: 'This is an ADF description',
								},
							],
						},
					],
				},
			},
		} as JiraIssue

		const result = extractTextFromDescription(issue)
		expect(result).toContain('This is an ADF description')
	})

	it('should handle null or undefined issue', () => {
		// Testing with null/undefined
		const resultNull = extractTextFromDescription(null as any)
		// Testing with null/undefined
		const resultUndefined = extractTextFromDescription(undefined as any)

		expect(resultNull).toBe('')
		expect(resultUndefined).toBe('')
	})

	it('should handle missing fields property', () => {
		const issue = {} as JiraIssue
		const result = extractTextFromDescription(issue)

		expect(result).toBe('')
	})

	it('should handle missing description property', () => {
		const issue = {
			fields: {},
		} as JiraIssue

		const result = extractTextFromDescription(issue)
		expect(result).toBe('')
	})

	it('should handle null description property', () => {
		const issue = {
			fields: {
				description: null,
			},
		} as JiraIssue

		const result = extractTextFromDescription(issue)
		expect(result).toBe('')
	})

	it('should handle unrecognized description format', () => {
		const issue = {
			fields: {
				description: {
					unknownFormat: true,
				},
			},
		} as unknown as JiraIssue

		const result = extractTextFromDescription(issue)
		expect(result).toBe('')
	})
})

describe('extractTextFromADF', () => {
	it('should extract text from ADF document', () => {
		const adf = {
			type: 'doc',
			version: 1,
			content: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'First paragraph',
						},
					],
				},
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'Second paragraph',
						},
					],
				},
			],
		}

		const result = extractTextFromADF(adf)
		expect(result).toContain('First paragraph')
		expect(result).toContain('Second paragraph')
	})

	it('should handle null or undefined ADF', () => {
		const resultNull = extractTextFromADF(null as unknown as ADFDocument)
		const resultUndefined = extractTextFromADF(undefined as unknown as ADFDocument)

		expect(resultNull).toBe('')
		expect(resultUndefined).toBe('')
	})

	it('should handle missing content array', () => {
		const adf = {
			type: 'doc',
			version: 1,
			content: [],
		} as ADFDocument

		const result = extractTextFromADF(adf)
		expect(result).toBe('')
	})

	it('should handle invalid content property', () => {
		const adf = {
			type: 'doc',
			version: 1,
			content: [] as any,
		} as ADFDocument

		const result = extractTextFromADF(adf)
		expect(result).toBe('')
	})
})

describe('extractTextFromNode', () => {
	it('should extract text from text node', () => {
		const node = {
			type: 'text',
			text: 'This is text',
		}

		const result = extractTextFromNode(node)
		expect(result).toBe('This is text')
	})

	it('should extract text from container node with content', () => {
		const node = {
			type: 'paragraph',
			content: [
				{
					type: 'text',
					text: 'Text in paragraph',
				},
				{
					type: 'text',
					text: 'More text',
				},
			],
		}

		const result = extractTextFromNode(node)
		expect(result).toBe('Text in paragraph More text')
	})

	it('should handle null or undefined nodes', () => {
		const resultNull = extractTextFromNode(null as unknown as DescriptionContentNode)
		const resultUndefined = extractTextFromNode(undefined as unknown as DescriptionContentNode)

		expect(resultNull).toBe('')
		expect(resultUndefined).toBe('')
	})

	it('should handle node without content or text', () => {
		const node = {
			type: 'unknown',
		}

		const result = extractTextFromNode(node)
		expect(result).toBe('')
	})

	it('should handle deeply nested content', () => {
		const node = {
			type: 'bulletList',
			content: [
				{
					type: 'listItem',
					content: [
						{
							type: 'paragraph',
							content: [
								{
									type: 'text',
									text: 'Nested text',
								},
							],
						},
					],
				},
			],
		}

		const result = extractTextFromNode(node)
		expect(result).toContain('Nested text')
	})

	it('should handle empty content array', () => {
		const node = {
			type: 'paragraph',
			content: [],
		}

		const result = extractTextFromNode(node)
		expect(result).toBe('')
	})

	it('should handle invalid content property', () => {
		const node = {
			type: 'paragraph',
			content: [],
		} as DescriptionContentNode

		const result = extractTextFromNode(node)
		expect(result).toBe('')
	})
})
