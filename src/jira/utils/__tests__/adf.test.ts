import { convertToADF } from '../adf'
import type { ADFDocument } from '../../types/atlassianDocument.types'

describe('adf utils', () => {
	describe('convertToADF', () => {
		it('should convert empty string to a valid ADF document with empty text', () => {
			const result = convertToADF('')

			const expected: ADFDocument = {
				version: 1,
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: '',
							},
						],
					},
				],
			}

			expect(result).toEqual(expected)
		})

		it('should convert a simple string to a valid ADF document', () => {
			const text = 'This is a test string'
			const result = convertToADF(text)

			const expected: ADFDocument = {
				version: 1,
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'This is a test string',
							},
						],
					},
				],
			}

			expect(result).toEqual(expected)
		})

		it('should convert a multi-line string with \\n to multiple paragraphs', () => {
			const text = 'Line 1\nLine 2\nLine 3'
			const result = convertToADF(text)

			const expected: ADFDocument = {
				version: 1,
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Line 1',
							},
						],
					},
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Line 2',
							},
						],
					},
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Line 3',
							},
						],
					},
				],
			}

			expect(result).toEqual(expected)
		})

		it('should convert a multi-line string with \\r to multiple paragraphs', () => {
			const text = 'Line 1\rLine 2\rLine 3'
			const result = convertToADF(text)

			const expected: ADFDocument = {
				version: 1,
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Line 1',
							},
						],
					},
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Line 2',
							},
						],
					},
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Line 3',
							},
						],
					},
				],
			}

			expect(result).toEqual(expected)
		})

		it('should convert a multi-line string with \\r\\n to multiple paragraphs', () => {
			const text = 'Line 1\r\nLine 2\r\nLine 3'
			const result = convertToADF(text)

			const expected: ADFDocument = {
				version: 1,
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Line 1',
							},
						],
					},
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Line 2',
							},
						],
					},
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Line 3',
							},
						],
					},
				],
			}

			expect(result).toEqual(expected)
		})

		it('should handle empty lines by filtering them out', () => {
			const text = 'Line 1\n\nLine 3'
			const result = convertToADF(text)

			const expected: ADFDocument = {
				version: 1,
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Line 1',
							},
						],
					},
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Line 3',
							},
						],
					},
				],
			}

			expect(result).toEqual(expected)
		})

		it('should handle text with multiple consecutive line breaks', () => {
			const text = 'Line 1\n\r\n\rLine 2'
			const result = convertToADF(text)

			const expected: ADFDocument = {
				version: 1,
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Line 1',
							},
						],
					},
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Line 2',
							},
						],
					},
				],
			}

			expect(result).toEqual(expected)
		})
	})
})
