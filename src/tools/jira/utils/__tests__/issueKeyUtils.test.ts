import { hasIssueKeyProperty, extractIssueKey } from '../issueKeyUtils'

describe('issueKeyUtils', function () {
	describe('hasIssueKeyProperty', function () {
		it('should return true for objects with valid issueKey string property', function () {
			expect(hasIssueKeyProperty({ issueKey: 'TEST-123' })).toBe(true)
		})

		it('should return false for null', function () {
			expect(hasIssueKeyProperty(null)).toBe(false)
		})

		it('should return false for undefined', function () {
			expect(hasIssueKeyProperty(undefined)).toBe(false)
		})

		it('should return false for non-objects', function () {
			expect(hasIssueKeyProperty(123)).toBe(false)
			expect(hasIssueKeyProperty('string')).toBe(false)
			expect(hasIssueKeyProperty(true)).toBe(false)
		})

		it('should return false for objects without issueKey property', function () {
			expect(hasIssueKeyProperty({})).toBe(false)
			expect(hasIssueKeyProperty({ otherKey: 'value' })).toBe(false)
		})

		it('should return false for objects with non-string issueKey', function () {
			expect(hasIssueKeyProperty({ issueKey: 123 })).toBe(false)
			expect(hasIssueKeyProperty({ issueKey: true })).toBe(false)
			expect(hasIssueKeyProperty({ issueKey: {} })).toBe(false)
			expect(hasIssueKeyProperty({ issueKey: [] })).toBe(false)
		})
	})

	describe('extractIssueKey', function () {
		it('should extract issueKey from direct parameters', function () {
			expect(extractIssueKey({ issueKey: 'TEST-123' })).toBe('TEST-123')
		})

		it('should extract issueKey from nested arguments', function () {
			expect(extractIssueKey({ arguments: { issueKey: 'TEST-123' } })).toBe('TEST-123')
		})

		it('should return null when issueKey is not found', function () {
			expect(extractIssueKey({})).toBeNull()
			expect(extractIssueKey({ arguments: {} })).toBeNull()
			expect(extractIssueKey({ other: 'value' })).toBeNull()
		})

		it('should handle non-object arguments property', function () {
			expect(extractIssueKey({ arguments: 'not-an-object' })).toBeNull()
			expect(extractIssueKey({ arguments: 123 })).toBeNull()
			expect(extractIssueKey({ arguments: null })).toBeNull()
		})
	})
})
