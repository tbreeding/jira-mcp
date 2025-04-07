/**
 * Unit tests for ADF formatting functions.
 */

import { describe, expect, it } from '@jest/globals'
import { convertToAdf, formatDescriptionForAdf } from '../formatAdf'

describe('convertToAdf', () => {
	it('should wrap plain text in a basic ADF paragraph structure', () => {
		const inputText = 'This is a test.'
		const expectedAdf = {
			type: 'doc',
			version: 1,
			content: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: inputText,
						},
					],
				},
			],
		}
		const result = convertToAdf(inputText)
		expect(result).toEqual(expectedAdf)
	})
})

describe('formatDescriptionForAdf', () => {
	it('should return ADF for a valid non-empty string', () => {
		const description = 'Valid description.'
		const expectedAdf = convertToAdf(description) // Use the tested function
		const result = formatDescriptionForAdf(description)
		expect(result).toEqual(expectedAdf)
	})

	it('should return undefined for an empty string', () => {
		const description = ''
		const result = formatDescriptionForAdf(description)
		expect(result).toBeUndefined()
	})

	it('should return undefined for null input', () => {
		const description = null
		const result = formatDescriptionForAdf(description)
		expect(result).toBeUndefined()
	})

	it('should return undefined for undefined input', () => {
		const description = undefined
		const result = formatDescriptionForAdf(description)
		expect(result).toBeUndefined()
	})

	it('should return undefined for non-string input (number)', () => {
		const description = 12345
		const result = formatDescriptionForAdf(description)
		expect(result).toBeUndefined()
	})

	it('should return undefined for non-string input (object)', () => {
		const description = { text: 'some description' }
		const result = formatDescriptionForAdf(description)
		expect(result).toBeUndefined()
	})
})
