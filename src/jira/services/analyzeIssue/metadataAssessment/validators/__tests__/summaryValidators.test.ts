/**
 * Tests for summary validators
 */
import { MESSAGES } from '../../constants/summaryValidationConstants'
import { validateActionableVerb, validateLength, validateNotVague } from '../summaryValidators'

describe('Summary validators', () => {
	describe('validateLength', () => {
		test('should fail for too short summaries', () => {
			const result = validateLength('Short')
			expect(result.isValid).toBe(false)
			expect(result.message).toBe(MESSAGES.TOO_SHORT)
		})

		test('should fail for too long summaries', () => {
			const longSummary = 'A'.repeat(101)
			const result = validateLength(longSummary)
			expect(result.isValid).toBe(false)
			expect(result.message).toBe(MESSAGES.TOO_LONG)
		})

		test('should pass for summaries of appropriate length', () => {
			const result = validateLength('This is a good length for a summary')
			expect(result.isValid).toBe(true)
			expect(result.message).toBe('')
		})
	})

	describe('validateNotVague', () => {
		test('should fail for vague single-word summaries', () => {
			const result = validateNotVague('bug')
			expect(result.isValid).toBe(false)
			expect(result.message).toBe(MESSAGES.TOO_VAGUE)
		})

		test('should pass for non-vague summaries', () => {
			const result = validateNotVague('Fix login button styling')
			expect(result.isValid).toBe(true)
		})

		test('should check against custom vague terms if provided', () => {
			const customVagueTerms = ['unclear', 'unspecified']
			const result = validateNotVague('unclear', customVagueTerms)
			expect(result.isValid).toBe(false)
		})
	})

	describe('validateActionableVerb', () => {
		test('should fail for summaries without action verbs', () => {
			const result = validateActionableVerb('The login button')
			expect(result.isValid).toBe(false)
			expect(result.message).toBe(MESSAGES.NOT_ACTIONABLE)
		})

		test('should pass for summaries with action verbs', () => {
			const result = validateActionableVerb('Fix the login button')
			expect(result.isValid).toBe(true)
		})

		test('should check against custom action verbs if provided', () => {
			const customActionVerbs = ['deploy', 'configure']
			const result = validateActionableVerb('Deploy the new service', customActionVerbs)
			expect(result.isValid).toBe(true)
		})

		test('should correctly match whole words only', () => {
			const result = validateActionableVerb('Prefix will not match action verbs')
			expect(result.isValid).toBe(false)
		})
	})
})
