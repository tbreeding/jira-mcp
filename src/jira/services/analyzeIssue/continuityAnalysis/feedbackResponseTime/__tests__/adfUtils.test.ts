import { processAdfBlock, extractTextFromItem } from '../adfUtils'

describe('processAdfBlock', () => {
	test('should extract text from a valid ADF block', () => {
		const mockBlock = {
			content: [{ text: 'Hello' }, { text: 'World' }],
		}
		expect(processAdfBlock(mockBlock)).toBe('Hello World')
	})

	test('should return empty string for blocks without content', () => {
		const mockBlock = {}
		expect(processAdfBlock(mockBlock)).toBe('')
	})

	test('should return empty string for blocks with non-array content', () => {
		const mockBlock = { content: 'not an array' }
		expect(processAdfBlock(mockBlock)).toBe('')
	})

	test('should handle null content property', () => {
		const mockBlock = { content: null }
		expect(processAdfBlock(mockBlock)).toBe('')
	})

	test('should handle undefined content property', () => {
		const mockBlock = { content: undefined }
		expect(processAdfBlock(mockBlock)).toBe('')
	})

	test('should handle empty content array', () => {
		const mockBlock = { content: [] }
		expect(processAdfBlock(mockBlock)).toBe('')
	})

	test('should handle content with undefined items', () => {
		const mockBlock = { content: [undefined, null] }
		expect(processAdfBlock(mockBlock)).toBe(' ')
	})

	test('should handle complex nested content structures', () => {
		const mockBlock = {
			content: [
				{
					text: 'First',
					nested: {
						content: [{ text: 'Should not be extracted' }],
					},
				},
				{
					text: 'Second',
				},
			],
		}
		expect(processAdfBlock(mockBlock)).toBe('First Second')
	})

	test('should handle mixed types in content array', () => {
		const mockBlock = {
			content: [{ text: 123 }, { text: true }, { text: false }, { text: 0 }, { text: '' }],
		}
		expect(processAdfBlock(mockBlock)).toBe('123 true false 0 ')
	})

	// Breaking down the combined test cases into separate, focused tests
	test('should return empty string when content is an object (not an array)', () => {
		const mockBlock = { content: { text: 'This is not an array' } }
		expect(processAdfBlock(mockBlock)).toBe('')
	})

	test('should return empty string when content is a number', () => {
		const mockBlock = { content: 42 }
		expect(processAdfBlock(mockBlock)).toBe('')
	})

	test('should return empty string when content is a string', () => {
		const mockBlock = { content: 'string content' }
		expect(processAdfBlock(mockBlock)).toBe('')
	})

	test('should return empty string when content is a boolean true', () => {
		const mockBlock = { content: true }
		expect(processAdfBlock(mockBlock)).toBe('')
	})

	test('should return empty string when content is a boolean false', () => {
		const mockBlock = { content: false }
		expect(processAdfBlock(mockBlock)).toBe('')
	})

	// Testing the case where block is null or undefined
	test('should handle null block', () => {
		// Use type assertion to handle TypeScript error
		expect(processAdfBlock(null as unknown as Record<string, unknown>)).toBe('')
	})

	test('should handle undefined block', () => {
		// Use type assertion to handle TypeScript error
		expect(processAdfBlock(undefined as unknown as Record<string, unknown>)).toBe('')
	})
})

describe('extractTextFromItem', () => {
	test('should extract text from an item with text property', () => {
		const mockItem = { text: 'Sample text' }
		expect(extractTextFromItem(mockItem)).toBe('Sample text')
	})

	test('should convert non-string text values to strings', () => {
		const mockItem = { text: 123 }
		expect(extractTextFromItem(mockItem)).toBe('123')
	})

	test('should convert boolean false to string', () => {
		const mockItem = { text: false }
		expect(extractTextFromItem(mockItem)).toBe('false')
	})

	test('should return empty string for undefined text', () => {
		const mockItem = {}
		expect(extractTextFromItem(mockItem)).toBe('')
	})

	test('should return empty string for null text', () => {
		const mockItem = { text: null }
		expect(extractTextFromItem(mockItem)).toBe('')
	})

	test('should handle numeric zero as text value', () => {
		const mockItem = { text: 0 }
		expect(extractTextFromItem(mockItem)).toBe('0')
	})

	test('should handle empty string as text value', () => {
		const mockItem = { text: '' }
		expect(extractTextFromItem(mockItem)).toBe('')
	})
})
