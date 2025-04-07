import { calculatePointToDurationRatio } from '../calculatePointToDurationRatio'
import { getStoryPoints } from '../getStoryPoints'
import type { JiraIssue } from '../../../../../../types/issue.types'

// Mock getStoryPoints to avoid having to create full issue objects
jest.mock('../getStoryPoints')
const mockGetStoryPoints = getStoryPoints as jest.MockedFunction<typeof getStoryPoints>

describe('calculatePointToDurationRatio', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('calculates ratio correctly', () => {
		// Setup
		const mockIssue = {} as JiraIssue
		mockGetStoryPoints.mockReturnValue(5)

		// Act
		const result = calculatePointToDurationRatio(mockIssue, 2)

		// Assert
		expect(result).toBe(2.5) // 5 points / 2 days = 2.5 points per day
		expect(mockGetStoryPoints).toHaveBeenCalledWith(mockIssue)
	})

	test('rounds to 2 decimal places', () => {
		mockGetStoryPoints.mockReturnValue(5)

		const result = calculatePointToDurationRatio({} as JiraIssue, 3)

		expect(result).toBe(1.67) // 5 points / 3 days = 1.6666... rounded to 1.67
	})

	test('returns null when story points are null', () => {
		mockGetStoryPoints.mockReturnValue(null)

		const result = calculatePointToDurationRatio({} as JiraIssue, 5)

		expect(result).toBeNull()
	})

	test('returns null when inProgressDays is null', () => {
		mockGetStoryPoints.mockReturnValue(5)

		const result = calculatePointToDurationRatio({} as JiraIssue, null)

		expect(result).toBeNull()
	})

	test('returns null when inProgressDays is zero', () => {
		mockGetStoryPoints.mockReturnValue(5)

		const result = calculatePointToDurationRatio({} as JiraIssue, 0)

		expect(result).toBeNull()
	})
})
