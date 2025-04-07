import { isValidDependencyWord } from '../validators'

describe('validators', () => {
	describe('isValidDependencyWord', () => {
		test('should return false for null or empty words', () => {
			expect(isValidDependencyWord('')).toBe(false)
			expect(isValidDependencyWord(null as unknown as string)).toBe(false)
			expect(isValidDependencyWord(undefined as unknown as string)).toBe(false)
		})

		test('should return false for common invalid words', () => {
			const invalidWords = ['is', 'the', 'a', 'an', 'and', 'or', 'for', 'to', 'with', 'by']
			invalidWords.forEach((word) => {
				expect(isValidDependencyWord(word)).toBe(false)
			})
		})

		test('should return false for words with 2 or fewer characters', () => {
			expect(isValidDependencyWord('a')).toBe(false)
			expect(isValidDependencyWord('ab')).toBe(false)
		})

		test('should return true for valid words', () => {
			expect(isValidDependencyWord('test')).toBe(true)
			expect(isValidDependencyWord('dependency')).toBe(true)
			expect(isValidDependencyWord('something')).toBe(true)
		})
	})
})
