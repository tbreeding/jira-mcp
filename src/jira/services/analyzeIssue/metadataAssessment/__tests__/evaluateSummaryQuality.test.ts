import { ACTION_VERBS, VAGUE_TERMS } from '../constants/summaryValidationConstants'
import { evaluateSummaryQuality, runValidators } from '../evaluateSummaryQuality'
import { validateActionableVerb, validateLength, validateNotVague } from '../validators/summaryValidators'
import type { JiraIssue } from '../../../../types/issue.types'

describe('Summary Quality Validation Functions', () => {
	// Test individual validator functions
	describe('validateLength', () => {
		it('should identify summaries that are too short', () => {
			const shortSummary = 'Bug'
			const result = validateLength(shortSummary)
			expect(result.isValid).toBe(false)
			expect(result.message).toBe('Too short: Lacks sufficient detail')
		})

		it('should identify summaries that are too long', () => {
			const longSummary =
				'This is an extremely long summary that goes into excessive detail about the issue and continues to provide information that would be better placed in the description field rather than the summary which should be concise and to the point'
			const result = validateLength(longSummary)
			expect(result.isValid).toBe(false)
			expect(result.message).toBe('Too long: Consider being more concise')
		})

		it('should accept summaries of appropriate length', () => {
			const goodSummary = 'Implement user authentication'
			const result = validateLength(goodSummary)
			expect(result.isValid).toBe(true)
		})
	})

	describe('validateNotVague', () => {
		it('should identify summaries that exactly match vague terms', () => {
			VAGUE_TERMS.forEach((term) => {
				const result = validateNotVague(term)
				expect(result.isValid).toBe(false)
				expect(result.message).toBe('Too vague: Be more specific about what needs to be done')
			})
		})

		it("should accept summaries that include but don't exactly match vague terms", () => {
			const summary = 'Fix the authentication bug in login form'
			const result = validateNotVague(summary)
			expect(result.isValid).toBe(true)
		})

		it('should respect custom vague terms list', () => {
			const summary = 'task'
			const customVagueTerms = ['task', 'todo']

			// Should pass with default vague terms
			let result = validateNotVague(summary)
			expect(result.isValid).toBe(true)

			// Should fail with custom vague terms
			result = validateNotVague(summary, customVagueTerms)
			expect(result.isValid).toBe(false)
		})
	})

	describe('validateActionableVerb', () => {
		it('should identify summaries without actionable verbs', () => {
			const summary = 'Authentication system documentation and manual'
			const result = validateActionableVerb(summary)
			expect(result.isValid).toBe(false)
			expect(result.message).toBe('Not actionable: Use clear verbs to describe what needs to be done')
		})

		it('should accept summaries with recognized actionable verbs', () => {
			ACTION_VERBS.forEach((verb) => {
				const summary = `${verb} the authentication system`
				const result = validateActionableVerb(summary)
				expect(result.isValid).toBe(true)
			})
		})

		it('should work with verbs regardless of case', () => {
			const summary = 'ADD authentication system'
			const result = validateActionableVerb(summary)
			expect(result.isValid).toBe(true)
		})

		it('should respect custom action verbs list', () => {
			const summary = 'deploy authentication system'
			const customVerbs = ['deploy', 'configure']

			// Should fail with default action verbs
			let result = validateActionableVerb(summary)
			expect(result.isValid).toBe(false)

			// Should pass with custom action verbs
			result = validateActionableVerb(summary, customVerbs)
			expect(result.isValid).toBe(true)
		})

		it('should recognize verbs only as whole words', () => {
			// "Fixed" contains "fix" but should be recognized as the verb
			const summary = 'Fixed authentication system'
			const result = validateActionableVerb(summary)
			expect(result.isValid).toBe(false) // "Fixed" is not in our action verbs list
		})
	})

	describe('runValidators', () => {
		it('should return the first failed validation', () => {
			const summary = 'Bug'
			const validators = [(s: string) => validateLength(s), (s: string) => validateNotVague(s)]

			const result = runValidators(summary, validators)
			expect(result.isValid).toBe(false)
			expect(result.message).toBe('Too short: Lacks sufficient detail')
		})

		it('should return success if all validations pass', () => {
			const summary = 'Implement authentication system with password reset'
			const validators = [
				(s: string) => validateLength(s),
				(s: string) => validateNotVague(s),
				(s: string) => validateActionableVerb(s),
			]

			const result = runValidators(summary, validators)
			expect(result.isValid).toBe(true)
			expect(result.message).toBe('Good: Clear, specific, and actionable')
		})
	})
})

// Integration tests with the original interface
describe('evaluateSummaryQuality', () => {
	it('should identify too short summaries', () => {
		const mockIssue = {
			fields: {
				summary: 'Bug',
			},
		} as unknown as JiraIssue

		const result = evaluateSummaryQuality(mockIssue)
		expect(result).toBe('Too short: Lacks sufficient detail')
	})

	it('should identify too long summaries', () => {
		const mockIssue = {
			fields: {
				summary:
					'This is an extremely long summary that goes into excessive detail about the issue and continues to provide information that would be better placed in the description field rather than the summary which should be concise and to the point',
			},
		} as unknown as JiraIssue

		const result = evaluateSummaryQuality(mockIssue)
		expect(result).toBe('Too long: Consider being more concise')
	})

	it('should identify exact match vague terms', () => {
		const mockIssue = {
			fields: {
				summary: 'implement',
			},
		} as unknown as JiraIssue

		const result = evaluateSummaryQuality(mockIssue)
		expect(result).toBe('Too short: Lacks sufficient detail')
	})

	it('should identify summaries without actionable verbs', () => {
		const mockIssue = {
			fields: {
				summary: 'Authentication system with username and password',
			},
		} as unknown as JiraIssue

		const result = evaluateSummaryQuality(mockIssue)
		expect(result).toBe('Not actionable: Use clear verbs to describe what needs to be done')
	})

	it('should recognize good summaries', () => {
		const mockIssue = {
			fields: {
				summary: 'Implement authentication system with username and password',
			},
		} as unknown as JiraIssue

		const result = evaluateSummaryQuality(mockIssue)
		expect(result).toBe('Good: Clear, specific, and actionable')
	})
})
