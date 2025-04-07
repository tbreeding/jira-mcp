import { calculateBaseCommentScore } from '../calculateBaseCommentScore'

describe('calculateBaseCommentScore', () => {
	test('should return score 10 for 15+ comments', () => {
		expect(calculateBaseCommentScore(15)).toBe(10)
		expect(calculateBaseCommentScore(20)).toBe(10)
	})

	test('should return score 9 for 10-14 comments', () => {
		expect(calculateBaseCommentScore(10)).toBe(9)
		expect(calculateBaseCommentScore(14)).toBe(9)
	})

	test('should return score 8 for 8-9 comments', () => {
		expect(calculateBaseCommentScore(8)).toBe(8)
		expect(calculateBaseCommentScore(9)).toBe(8)
	})

	test('should return score 7 for 6-7 comments', () => {
		expect(calculateBaseCommentScore(6)).toBe(7)
		expect(calculateBaseCommentScore(7)).toBe(7)
	})

	test('should return score 6 for 4-5 comments', () => {
		expect(calculateBaseCommentScore(4)).toBe(6)
		expect(calculateBaseCommentScore(5)).toBe(6)
	})

	test('should return score 5 for 3 comments', () => {
		expect(calculateBaseCommentScore(3)).toBe(5)
	})

	test('should return score 4 for 2 comments', () => {
		expect(calculateBaseCommentScore(2)).toBe(4)
	})

	test('should return score 3 for 0-1 comments', () => {
		expect(calculateBaseCommentScore(0)).toBe(3)
		expect(calculateBaseCommentScore(1)).toBe(3)
	})

	// Test the fallback case (shouldn't happen in practice but ensures 100% branch coverage)
	test('should return default score 3 in the unlikely event no range is matched', () => {
		// Mock implementation to test the fallback branch
		const originalFind = Array.prototype.find
		Array.prototype.find = jest.fn().mockReturnValue(undefined)

		expect(calculateBaseCommentScore(5)).toBe(3)

		// Restore original implementation
		Array.prototype.find = originalFind
	})
})
