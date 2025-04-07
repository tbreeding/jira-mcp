import { getCommentText } from '../textExtraction'
import { processAdfBlock } from '../adfUtils'

// Mock the adfUtils module
jest.mock('../adfUtils')

// Type cast the mock function for better type safety
const mockProcessAdfBlock = processAdfBlock as jest.Mock

describe('getCommentText', function () {
	beforeEach(function () {
		// Clear mock history before each test
		mockProcessAdfBlock.mockClear()
	})

	it('should return the body if it is a string', function () {
		const body = 'This is a simple text comment.'
		expect(getCommentText(body as any)).toBe(body)
	})

	it('should return empty string for null or undefined body', function () {
		expect(getCommentText(null as any)).toBe('')
		expect(getCommentText(undefined as any)).toBe('')
	})

	it('should return empty string for an empty object body', function () {
		expect(getCommentText({})).toBe('')
	})

	it('should extract text from Atlassian Document Format (ADF)', function () {
		const adfBlock1 = { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }
		const adfBlock2 = { type: 'paragraph', content: [{ type: 'text', text: 'World' }] }
		const adfBody = {
			type: 'doc',
			version: 1,
			content: [adfBlock1, adfBlock2],
		}

		// Configure the mock implementation for processAdfBlock
		mockProcessAdfBlock.mockImplementation(function (block) {
			if (block === adfBlock1) {
				return 'Hello'
			}
			if (block === adfBlock2) {
				return 'World'
			}
			return ''
		})

		const result = getCommentText(adfBody)

		expect(result).toBe('Hello World')
		expect(mockProcessAdfBlock).toHaveBeenCalledTimes(2)
		expect(mockProcessAdfBlock).toHaveBeenCalledWith(adfBlock1, 0, [adfBlock1, adfBlock2])
		expect(mockProcessAdfBlock).toHaveBeenCalledWith(adfBlock2, 1, [adfBlock1, adfBlock2])
	})

	it('should return empty string for ADF with empty content', function () {
		const adfBody = {
			type: 'doc',
			version: 1,
			content: [],
		}

		expect(getCommentText(adfBody)).toBe('')
		expect(mockProcessAdfBlock).not.toHaveBeenCalled()
	})

	it('should handle ADF content that results in empty strings from processing', function () {
		const adfBlock1 = { type: 'rule' } // Example block type processed to empty string
		const adfBlock2 = { type: 'panel', content: [] } // Another example
		const adfBody = {
			type: 'doc',
			version: 1,
			content: [adfBlock1, adfBlock2],
		}

		// Configure mock to return empty strings
		mockProcessAdfBlock.mockReturnValue('')

		const result = getCommentText(adfBody)

		expect(result).toBe('')
		expect(mockProcessAdfBlock).toHaveBeenCalledTimes(2)
	})

	it('should handle complex ADF structures with nested content if processAdfBlock handles them', function () {
		const complexBlock = {
			type: 'blockquote',
			content: [
				{
					type: 'paragraph',
					content: [{ type: 'text', text: 'Quote' }],
				},
			],
		}
		const adfBody = {
			type: 'doc',
			version: 1,
			content: [complexBlock],
		}

		mockProcessAdfBlock.mockReturnValue('Processed Quote')

		const result = getCommentText(adfBody)

		expect(result).toBe('Processed Quote')
		expect(mockProcessAdfBlock).toHaveBeenCalledTimes(1)
		expect(mockProcessAdfBlock).toHaveBeenCalledWith(complexBlock, 0, [complexBlock])
	})
})
