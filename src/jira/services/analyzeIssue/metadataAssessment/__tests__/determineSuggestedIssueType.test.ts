import { determineSuggestedIssueType } from '../determineSuggestedIssueType'

describe('determineSuggestedIssueType', () => {
	describe('for Bug type', () => {
		it('should return Bug when type matches content', () => {
			const type = determineSuggestedIssueType('Bug', true, false, false)
			expect(type).toBe('Bug')
		})

		it('should suggest Story when Bug actually has feature indicators', () => {
			const type = determineSuggestedIssueType('Bug', false, true, false)
			expect(type).toBe('Story')
		})

		it('should suggest Task when Bug has no bug or feature indicators', () => {
			const type = determineSuggestedIssueType('Bug', false, false, true)
			expect(type).toBe('Task')
		})

		it('should suggest Task when Bug has neither bug, feature, nor task indicators', () => {
			const type = determineSuggestedIssueType('Bug', false, false, false)
			expect(type).toBe('Task')
		})

		it('should keep Bug when it has both bug and feature indicators', () => {
			const type = determineSuggestedIssueType('Bug', true, true, false)
			expect(type).toBe('Bug')
		})
	})

	describe('for Story type', () => {
		it('should return Story when type matches content', () => {
			const type = determineSuggestedIssueType('Story', false, true, false)
			expect(type).toBe('Story')
		})

		it('should suggest Bug when Story actually has bug indicators', () => {
			const type = determineSuggestedIssueType('Story', true, false, false)
			expect(type).toBe('Bug')
		})

		it('should keep Story when it has both bug and feature indicators', () => {
			const type = determineSuggestedIssueType('Story', true, true, false)
			expect(type).toBe('Story')
		})

		it('should keep Story when it has no clear indicators', () => {
			const type = determineSuggestedIssueType('Story', false, false, false)
			expect(type).toBe('Story')
		})
	})

	describe('for Task type', () => {
		it('should return Task when type matches content', () => {
			const type = determineSuggestedIssueType('Task', false, false, true)
			expect(type).toBe('Task')
		})

		it('should suggest Bug when Task actually has bug indicators', () => {
			const type = determineSuggestedIssueType('Task', true, false, false)
			expect(type).toBe('Bug')
		})

		it('should suggest Story when Task actually has feature indicators', () => {
			const type = determineSuggestedIssueType('Task', false, true, false)
			expect(type).toBe('Story')
		})

		it('should keep Task when it has both bug and feature indicators but also task indicators', () => {
			const type = determineSuggestedIssueType('Task', true, true, true)
			expect(type).toBe('Task')
		})

		it('should default to Task when no clear indicators are present', () => {
			const type = determineSuggestedIssueType('Task', false, false, false)
			expect(type).toBe('Task')
		})
	})

	describe('for other issue types', () => {
		it('should return the original type for non-standard issue types', () => {
			const type = determineSuggestedIssueType('Epic', true, true, true)
			expect(type).toBe('Epic')
		})
	})
})
