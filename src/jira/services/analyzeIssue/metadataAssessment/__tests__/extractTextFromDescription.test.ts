import { extractTextFromDescription } from '../extractTextFromDescription'
import type { IssueDescription } from '../../../../types/issue.types'

describe('extractTextFromDescription', () => {
	it('should extract text from a description with content', () => {
		const mockDescription: IssueDescription = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'This is a description',
						},
					],
				},
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'with multiple paragraphs',
						},
					],
				},
			],
		}

		const result = extractTextFromDescription(mockDescription)
		expect(result).toBe('This is a description with multiple paragraphs')
	})

	it('should extract text from nested content structures', () => {
		const mockDescription: IssueDescription = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'Outer text ',
						},
						{
							type: 'inlineCard',
							content: [
								{
									type: 'text',
									text: 'inner text',
								},
							],
						},
					],
				},
			],
		}

		const result = extractTextFromDescription(mockDescription)
		expect(result).toBe('Outer text  inner text')
	})

	it('should handle null content in nested structure', () => {
		const mockDescription = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'Text with ',
						},
						{
							type: 'inlineCard',
							content: undefined,
						},
					],
				},
			],
		} as IssueDescription

		const result = extractTextFromDescription(mockDescription)
		expect(result).toBe('Text with  ')
	})

	it('should handle null content passed to extractText function', () => {
		const mockDescription = {
			type: 'doc',
			content: null,
		} as unknown as IssueDescription

		const result = extractTextFromDescription(mockDescription)
		expect(result).toBe('')
	})

	it('should handle null description', () => {
		const result = extractTextFromDescription(null)
		expect(result).toBe('')
	})

	it('should handle string description', () => {
		const result = extractTextFromDescription('Plain text description')
		expect(result).toBe('Plain text description')
	})

	it('should handle empty content', () => {
		const mockDescription: IssueDescription = {
			type: 'doc',
			content: [],
		}

		const result = extractTextFromDescription(mockDescription)
		expect(result).toBe('')
	})

	it('should handle description with no content property', () => {
		const mockDescription = {
			type: 'doc',
		} as IssueDescription

		const result = extractTextFromDescription(mockDescription)
		expect(result).toBe('')
	})

	it('should handle description with content but no text', () => {
		const mockDescription: IssueDescription = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'inlineCard',
						},
					],
				},
			],
		}

		const result = extractTextFromDescription(mockDescription)
		expect(result).toBe('')
	})

	it('should handle null argument in extractText function', () => {
		// This test is designed to hit line 13 in extractTextFromDescription.ts
		// where the extractText function is called with null content
		const mockDescription = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						null, // This will cause content to be null when passed to extractText
					],
				},
			],
		} as unknown as IssueDescription

		const result = extractTextFromDescription(mockDescription)
		expect(result).toBe('')
	})
})
