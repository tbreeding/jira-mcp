import { calculateThresholdDate } from '../thresholdCalculation'
import type { JiraIssue } from '../../../../../types/issue.types'

describe('calculateThresholdDate', () => {
	// Set specific test date
	const testDate = new Date('2023-01-30T00:00:00.000Z')

	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('should calculate threshold date for resolved issue', () => {
		// Arrange
		const issue = {
			fields: {
				created: '2023-01-01T00:00:00.000Z',
				resolutiondate: '2023-01-21T00:00:00.000Z',
			},
		} as unknown as JiraIssue

		const threshold = 0.7

		// Expected:
		// Start = 2023-01-01T00:00:00.000Z
		// End = 2023-01-21T00:00:00.000Z
		// Total duration = 20 days
		// 70% threshold = 14 days
		// Expected date = 2023-01-15T00:00:00.000Z

		// Act
		const result = calculateThresholdDate(issue, threshold)

		// Assert
		const expectedDate = new Date('2023-01-15T00:00:00.000Z')
		expect(result.getTime()).toBe(expectedDate.getTime())
	})

	test('should use current date for unresolved issue', () => {
		// Arrange
		const issue = {
			fields: {
				created: '2023-01-01T00:00:00.000Z',
				resolutiondate: null,
			},
		} as unknown as JiraIssue

		const threshold = 0.5

		// Use fake timers and set the system time
		jest.useFakeTimers()
		jest.setSystemTime(testDate)

		// Expected:
		// Start = 2023-01-01T00:00:00.000Z
		// End = 2023-01-30T00:00:00.000Z (mocked current date)
		// Total duration = 29 days
		// 50% threshold = 14.5 days
		// Expected date = 2023-01-15T12:00:00.000Z

		// Act
		const result = calculateThresholdDate(issue, threshold)

		// Restore real timers
		jest.useRealTimers()

		// Assert
		const expectedDate = new Date('2023-01-15T12:00:00.000Z')
		expect(result.getTime()).toBe(expectedDate.getTime())
	})

	test('should handle string resolutiondate', () => {
		// Arrange
		const issue = {
			fields: {
				created: '2023-01-01T00:00:00.000Z',
				resolutiondate: '2023-01-11T00:00:00.000Z',
			},
		} as unknown as JiraIssue

		const threshold = 0.8

		// Expected:
		// Start = 2023-01-01T00:00:00.000Z
		// End = 2023-01-11T00:00:00.000Z
		// Total duration = 10 days
		// 80% threshold = 8 days
		// Expected date = 2023-01-09T00:00:00.000Z

		// Act
		const result = calculateThresholdDate(issue, threshold)

		// Assert
		const expectedDate = new Date('2023-01-09T00:00:00.000Z')
		expect(result.getTime()).toBe(expectedDate.getTime())
	})

	test('should handle various threshold values', () => {
		// Arrange
		const issue = {
			fields: {
				created: '2023-01-01T00:00:00.000Z',
				resolutiondate: '2023-01-21T00:00:00.000Z',
			},
		} as unknown as JiraIssue

		// Test cases with different thresholds
		const testCases = [
			{ threshold: 0, expected: '2023-01-01T00:00:00.000Z' },
			{ threshold: 0.25, expected: '2023-01-06T00:00:00.000Z' },
			{ threshold: 0.5, expected: '2023-01-11T00:00:00.000Z' },
			{ threshold: 1, expected: '2023-01-21T00:00:00.000Z' },
		]

		// Act & Assert
		testCases.forEach((testCase) => {
			const result = calculateThresholdDate(issue, testCase.threshold)
			const expectedDate = new Date(testCase.expected)
			expect(result.getTime()).toBe(expectedDate.getTime())
		})
	})
})
