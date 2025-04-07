import { determineComplexityLevel } from '../determineComplexityLevel'

describe('determineComplexityLevel', function () {
	test('should return trivial for scores 0-2', function () {
		expect(determineComplexityLevel(0)).toBe('trivial')
		expect(determineComplexityLevel(1)).toBe('trivial')
		expect(determineComplexityLevel(2)).toBe('trivial')
	})

	test('should return simple for scores 3-4', function () {
		expect(determineComplexityLevel(3)).toBe('simple')
		expect(determineComplexityLevel(4)).toBe('simple')
	})

	test('should return moderate for scores 5-6', function () {
		expect(determineComplexityLevel(5)).toBe('moderate')
		expect(determineComplexityLevel(6)).toBe('moderate')
	})

	test('should return complex for scores 7-8', function () {
		expect(determineComplexityLevel(7)).toBe('complex')
		expect(determineComplexityLevel(8)).toBe('complex')
	})

	test('should return very complex for scores 9+', function () {
		expect(determineComplexityLevel(9)).toBe('very complex')
		expect(determineComplexityLevel(10)).toBe('very complex')
		expect(determineComplexityLevel(15)).toBe('very complex')
	})
})
