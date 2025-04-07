import { DEPENDENCY_PHRASES } from '../../utils/patterns/dependencyPhrases'
import { isDependencyRelated } from '../isDependencyRelated'

describe('isDependencyRelated', () => {
	it('should return true when issue key is near a dependency phrase', () => {
		const text = 'This issue depends on PROJ-123 and is related to another task.'

		const result = isDependencyRelated(text, 'PROJ-123')

		expect(result).toBe(true)
	})

	it('should return false when issue key is not in the text', () => {
		const text = 'This issue depends on something else.'

		const result = isDependencyRelated(text, 'PROJ-123')

		expect(result).toBe(false)
	})

	it('should return false when no dependency phrase is near the issue key', () => {
		const text = 'Also mentioned PROJ-123 in this text, but not as a dependency.'

		const result = isDependencyRelated(text, 'PROJ-123')

		expect(result).toBe(false)
	})

	it('should detect dependency relationship when phrase is before the key', () => {
		const text = 'This task is blocked by PROJ-123, which is still in progress.'

		const result = isDependencyRelated(text, 'PROJ-123')

		expect(result).toBe(true)
	})

	it('should detect dependency relationship when phrase is after the key', () => {
		const text = 'PROJ-123 is a prerequisite for this task to start.'

		const result = isDependencyRelated(text, 'PROJ-123')

		expect(result).toBe(true)
	})

	it('should check for all known dependency phrases', () => {
		// Test each dependency phrase to ensure they all work
		for (const phrase of DEPENDENCY_PHRASES) {
			const text = `This task ${phrase} PROJ-123 to proceed.`

			const result = isDependencyRelated(text, 'PROJ-123')

			expect(result).toBe(true)
		}
	})

	it('should handle text with multiple dependency phrases', () => {
		const text = 'This depends on PROJ-123 and is also blocked by PROJ-456'

		const result = isDependencyRelated(text, 'PROJ-123')

		expect(result).toBe(true)
	})

	it('should find dependency phrase just within the context window', () => {
		// Position a dependency phrase near the 100-char window boundary
		// Place "depends on" exactly 90 characters before the issue key
		// This ensures it's found within the 100-char context window
		const padding = 'a'.repeat(80)
		const text = `depends on ${padding}PROJ-123`

		const result = isDependencyRelated(text, 'PROJ-123')

		expect(result).toBe(true)
	})

	it('should not detect relationship when phrase is beyond context window', () => {
		// Create text with dependency phrase beyond the 100-char context window
		const padding = 'a'.repeat(101)
		const text = `depends on ${padding}PROJ-123`

		const result = isDependencyRelated(text, 'PROJ-123')

		expect(result).toBe(false)
	})

	it('should be case sensitive for issue keys', () => {
		// The implementation does not convert case, so "proj-123" is different from "PROJ-123"
		const text = 'This issue depends on proj-123 for completion.'

		const result = isDependencyRelated(text, 'PROJ-123')

		expect(result).toBe(false)
	})

	it('should find issue key when case matches exactly', () => {
		const text = 'This issue depends on PROJ-123 for completion.'

		const result = isDependencyRelated(text, 'PROJ-123')

		expect(result).toBe(true)
	})
})
