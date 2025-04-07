import { boundScoreValue } from '../boundScoreValue'

describe('boundScoreValue', function () {
	it('returns the original score when within the valid range', function () {
		expect(boundScoreValue(5)).toBe(5)
		expect(boundScoreValue(1)).toBe(1)
		expect(boundScoreValue(10)).toBe(10)
	})

	it('returns 1 when the score is below the minimum', function () {
		expect(boundScoreValue(0)).toBe(1)
		expect(boundScoreValue(-5)).toBe(1)
	})

	it('returns 10 when the score is above the maximum', function () {
		expect(boundScoreValue(11)).toBe(10)
		expect(boundScoreValue(15)).toBe(10)
	})

	it('rounds scores to the nearest integer', function () {
		expect(boundScoreValue(5.4)).toBe(5)
		expect(boundScoreValue(5.5)).toBe(6)
		expect(boundScoreValue(9.9)).toBe(10)
		expect(boundScoreValue(1.1)).toBe(1)
	})
})
