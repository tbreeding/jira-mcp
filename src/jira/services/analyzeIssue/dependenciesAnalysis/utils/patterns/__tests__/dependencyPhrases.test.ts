import { DEPENDENCY_PHRASES } from '../dependencyPhrases'

describe('DEPENDENCY_PHRASES', () => {
	it('should contain common dependency phrases', () => {
		// Verify the array contains common phrases
		expect(DEPENDENCY_PHRASES).toContain('depends on')
		expect(DEPENDENCY_PHRASES).toContain('blocked by')
		expect(DEPENDENCY_PHRASES).toContain('waiting for')
		expect(DEPENDENCY_PHRASES).toContain('requires')
	})

	it('should be an array of strings', () => {
		// Verify the array contains only strings
		expect(Array.isArray(DEPENDENCY_PHRASES)).toBe(true)
		expect(DEPENDENCY_PHRASES.length).toBeGreaterThan(0)
		DEPENDENCY_PHRASES.forEach((phrase) => {
			expect(typeof phrase).toBe('string')
		})
	})

	it('should not contain empty strings', () => {
		// Verify the array doesn't contain empty strings
		DEPENDENCY_PHRASES.forEach((phrase) => {
			expect(phrase.trim()).not.toBe('')
		})
	})
})
