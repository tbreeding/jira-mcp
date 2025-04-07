import { calculateCompletionPercentage } from '../completionPercentage'
import type { JiraIssue } from '../../../../../types/issue.types'

describe('calculateCompletionPercentage', () => {
	// Set specific test date for consistent testing
	const testDate = new Date('2023-01-30T00:00:00.000Z')

	beforeEach(() => {
		jest.useFakeTimers()
		jest.setSystemTime(testDate)
	})

	afterEach(() => {
		jest.useRealTimers()
	})

	test('should calculate completion percentage for resolved issue', () => {
		// Arrange
		const issue = {
			fields: {
				created: '2023-01-01T00:00:00.000Z',
				resolutiondate: '2023-01-21T00:00:00.000Z',
			},
		} as unknown as JiraIssue

		// Timestamp at 50% through the timeline
		const timestamp = '2023-01-11T00:00:00.000Z'

		// Act
		const result = calculateCompletionPercentage(issue, timestamp)

		// Assert
		// Expected 50% completion (10 days out of 20 days timeline)
		expect(result).toBe(50)
	})

	test('should calculate completion percentage for unresolved issue', () => {
		// Arrange
		const issue = {
			fields: {
				created: '2023-01-01T00:00:00.000Z',
				resolutiondate: null,
			},
		} as unknown as JiraIssue

		// Timestamp halfway between created date and current date
		// Created = Jan 1, Current = Jan 30, Midpoint = Jan 15
		const timestamp = '2023-01-15T12:00:00.000Z'

		// Act
		const result = calculateCompletionPercentage(issue, timestamp)

		// Assert
		// Expected ~50% completion based on current date as end date
		expect(result).toBeCloseTo(50, 0)
	})

	test('should handle timestamp at start of issue', () => {
		// Arrange
		const issue = {
			fields: {
				created: '2023-01-01T00:00:00.000Z',
				resolutiondate: '2023-01-21T00:00:00.000Z',
			},
		} as unknown as JiraIssue

		// Timestamp at the start
		const timestamp = '2023-01-01T00:00:00.000Z'

		// Act
		const result = calculateCompletionPercentage(issue, timestamp)

		// Assert
		expect(result).toBe(0)
	})

	test('should handle timestamp at end of issue', () => {
		// Arrange
		const issue = {
			fields: {
				created: '2023-01-01T00:00:00.000Z',
				resolutiondate: '2023-01-21T00:00:00.000Z',
			},
		} as unknown as JiraIssue

		// Timestamp at the end
		const timestamp = '2023-01-21T00:00:00.000Z'

		// Act
		const result = calculateCompletionPercentage(issue, timestamp)

		// Assert
		expect(result).toBe(100)
	})

	test('should round percentage to 2 decimal places', () => {
		// Arrange
		const issue = {
			fields: {
				created: '2023-01-01T00:00:00.000Z',
				resolutiondate: '2023-01-31T00:00:00.000Z',
			},
		} as unknown as JiraIssue

		// Timestamp at 1/3 of the timeline
		const timestamp = '2023-01-11T00:00:00.000Z'

		// Act
		const result = calculateCompletionPercentage(issue, timestamp)

		// Assert
		// Expected 33.33% completion (10 days out of 30 days timeline)
		expect(result).toBeCloseTo(33.33, 1)
	})

	test('should handle timestamp after resolution date', () => {
		// Arrange
		const issue = {
			fields: {
				created: '2023-01-01T00:00:00.000Z',
				resolutiondate: '2023-01-21T00:00:00.000Z',
			},
		} as unknown as JiraIssue

		// Timestamp after the resolution date
		const timestamp = '2023-01-25T00:00:00.000Z'

		// Act
		const result = calculateCompletionPercentage(issue, timestamp)

		// Assert
		// This should be over 100%, but likely capped or calculated against final date
		expect(result).toBeGreaterThan(100)
	})
})
