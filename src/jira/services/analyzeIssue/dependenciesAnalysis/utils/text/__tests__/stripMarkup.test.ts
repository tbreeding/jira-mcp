import { stripMarkup } from '../stripMarkup'

describe('stripMarkup', () => {
	it('should remove HTML tags from text', () => {
		const htmlText = 'This is <strong>bold</strong> and <em>italic</em> text'
		const result = stripMarkup(htmlText)

		expect(result).toBe('This is  bold  and  italic  text')
	})

	it('should remove Markdown formatting', () => {
		const markdownText = 'This is **bold** and _italic_ and ~~strikethrough~~ text'
		const result = stripMarkup(markdownText)

		expect(result).toBe('This is bold and italic and strikethrough text')
	})

	it('should handle mixed HTML and Markdown', () => {
		const mixedText = '<div>This is **bold** and <em>_italic_</em> text</div>'
		const result = stripMarkup(mixedText)

		expect(result).toBe('This is bold and  italic  text')
	})

	it('should remove code blocks', () => {
		const codeText = 'This is `inline code` and ```code block```'
		const result = stripMarkup(codeText)

		expect(result).toBe('This is inline code and code block')
	})

	it('should remove headings', () => {
		const headingText = '# Heading 1\n## Heading 2'
		const result = stripMarkup(headingText)

		expect(result).toBe('Heading 1\n Heading 2')
	})

	it('should handle complex HTML', () => {
		const complexHtml = '<div class="container"><p>This is a <a href="http://example.com">link</a></p></div>'
		const result = stripMarkup(complexHtml)

		expect(result).toBe('This is a  link')
	})

	it('should trim whitespace', () => {
		const paddedText = '  This has extra spaces   '
		const result = stripMarkup(paddedText)

		expect(result).toBe('This has extra spaces')
	})

	it('should handle empty string input', () => {
		const result = stripMarkup('')

		expect(result).toBe('')
	})

	it('should handle null or undefined input', () => {
		// Testing with null/undefined
		const resultNull = stripMarkup(null as any)
		// Testing with null/undefined
		const resultUndefined = stripMarkup(undefined as any)

		expect(resultNull).toBe('')
		expect(resultUndefined).toBe('')
	})
})
