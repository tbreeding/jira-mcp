import { extractTextFromDescription } from '../text/extractTextFromDescription'
import type { JiraIssue } from '../../../../../types/issue.types'

describe('extractTextFromDescription', () => {
	it('should extract plain text from string description', () => {
		const issue = {
			fields: {
				description: 'This is a plain text description',
			},
		} as JiraIssue

		const result = extractTextFromDescription(issue)
		expect(result).toBe('This is a plain text description')
	})

	it('should extract text from Atlassian Document Format description', () => {
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

	it('should handle nested Atlassian Document Format content', () => {
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
									text: 'First paragraph',
								},
							],
						},
						{
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
													text: 'Bullet point 1',
												},
											],
										},
									],
								},
								{
									type: 'listItem',
									content: [
										{
											type: 'paragraph',
											content: [
												{
													type: 'text',
													text: 'Bullet point 2',
												},
											],
										},
									],
								},
							],
						},
					],
				},
			},
		} as JiraIssue

		const result = extractTextFromDescription(issue)
		expect(result).toContain('First paragraph')
		expect(result).toContain('Bullet point 1')
		expect(result).toContain('Bullet point 2')
	})

	it('should handle empty description', () => {
		const issue = {
			fields: {
				description: '',
			},
		} as JiraIssue

		const result = extractTextFromDescription(issue)
		expect(result).toBe('')
	})

	it('should handle null description', () => {
		const issue = {
			fields: {
				description: null,
			},
		} as JiraIssue

		const result = extractTextFromDescription(issue)
		expect(result).toBe('')
	})

	it('should handle undefined description', () => {
		const issue = {
			fields: {},
		} as JiraIssue

		const result = extractTextFromDescription(issue)
		expect(result).toBe('')
	})

	it('should handle missing fields property', () => {
		const issue = {} as JiraIssue

		const result = extractTextFromDescription(issue)
		expect(result).toBe('')
	})

	it('should handle complex markup and extract only the text', () => {
		const issue = {
			fields: {
				description: `h2. Heading

*Bold text* and _italic_ text
 
|| header 1 || header 2 ||
| cell 1 | cell 2 |

[link text|http://example.com]

{code}
some code block
{code}`,
			},
		} as JiraIssue

		const result = extractTextFromDescription(issue)
		expect(result).toContain('Heading')
		expect(result).toContain('Bold text')
		expect(result).toContain('italic')
		expect(result).toContain('header 1')
		expect(result).toContain('cell 1')
		expect(result).toContain('link text')
		expect(result).toContain('some code block')
	})

	it('should handle complex ADF with code blocks and links', () => {
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
									text: 'Text with ',
								},
								{
									type: 'text',
									text: 'bold',
									marks: [{ type: 'strong' }],
								},
								{
									type: 'text',
									text: ' formatting',
								},
							],
						},
						{
							type: 'codeBlock',
							content: [
								{
									type: 'text',
									text: 'console.log("hello world")',
								},
							],
						},
						{
							type: 'paragraph',
							content: [
								{
									type: 'text',
									text: 'Click ',
								},
								{
									type: 'inlineCard',
									attrs: {
										url: 'https://example.com',
									},
								},
								{
									type: 'text',
									text: ' for more info',
								},
							],
						},
					],
				},
			},
		} as JiraIssue

		const result = extractTextFromDescription(issue)
		// The actual format might include extra spaces
		expect(result).toContain('Text with')
		expect(result).toContain('bold')
		expect(result).toContain('formatting')
		expect(result).toContain('console.log("hello world")')
		expect(result).toContain('Click')
		expect(result).toContain('for more info')
	})
})
