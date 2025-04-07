import { calculateActiveWorkTime } from '../activeTimeCalculation'
import * as historyHandling from '../historyHandling'
import * as statusChanges from '../statusChanges'
import type { JiraIssue } from '../../../../../types/issue.types'

jest.mock('../historyHandling')
jest.mock('../statusChanges')

describe('calculateActiveWorkTime', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('should call handleIssueWithoutHistory when no changelog exists', () => {
		// Setup
		const mockIssue = {
			fields: {},
			// No changelog
		} as unknown as JiraIssue

		const mockHandleIssueWithoutHistory = jest.spyOn(historyHandling, 'handleIssueWithoutHistory')
		mockHandleIssueWithoutHistory.mockReturnValue(5000)

		// Execute
		const result = calculateActiveWorkTime(mockIssue)

		// Verify
		expect(mockHandleIssueWithoutHistory).toHaveBeenCalledWith(mockIssue)
		expect(result).toBe(5000)
	})

	test('should call handleIssueWithoutHistory when changelog is empty', () => {
		// Setup
		const mockIssue = {
			fields: {},
			changelog: {
				histories: [],
			},
		} as unknown as JiraIssue

		const mockHandleIssueWithoutHistory = jest.spyOn(historyHandling, 'handleIssueWithoutHistory')
		mockHandleIssueWithoutHistory.mockReturnValue(7000)

		// Execute
		const result = calculateActiveWorkTime(mockIssue)

		// Verify
		expect(mockHandleIssueWithoutHistory).toHaveBeenCalledWith(mockIssue)
		expect(result).toBe(7000)
	})

	test('should call handleIssueWithoutHistory when histories is null', () => {
		// Setup
		const mockIssue = {
			fields: {},
			changelog: {
				histories: null,
			},
		} as unknown as JiraIssue

		const mockHandleIssueWithoutHistory = jest.spyOn(historyHandling, 'handleIssueWithoutHistory')
		mockHandleIssueWithoutHistory.mockReturnValue(7000)

		// Execute
		const result = calculateActiveWorkTime(mockIssue)

		// Verify
		expect(mockHandleIssueWithoutHistory).toHaveBeenCalledWith(mockIssue)
		expect(result).toBe(7000)
	})

	test('should call handleIssueWithoutHistory when no status changes', () => {
		// Setup
		const mockIssue = {
			fields: {},
			changelog: {
				histories: [{ id: '123' }],
			},
		} as unknown as JiraIssue

		const mockExtractStatusChanges = jest.spyOn(statusChanges, 'extractStatusChanges')
		mockExtractStatusChanges.mockReturnValue([])

		const mockHandleIssueWithoutHistory = jest.spyOn(historyHandling, 'handleIssueWithoutHistory')
		mockHandleIssueWithoutHistory.mockReturnValue(10000)

		// Execute
		const result = calculateActiveWorkTime(mockIssue)

		// Verify
		expect(mockExtractStatusChanges).toHaveBeenCalledWith(mockIssue)
		expect(mockHandleIssueWithoutHistory).toHaveBeenCalledWith(mockIssue)
		expect(result).toBe(10000)
	})

	test('should call calculateActiveTimeFromStatusChanges when status changes exist', () => {
		// Setup
		const mockIssue = {
			fields: {},
			changelog: {
				histories: [{ id: '123' }],
			},
		} as unknown as JiraIssue

		const mockStatusChanges = [
			{ date: new Date('2023-01-01T10:00:00.000Z'), fromStatus: 'To Do', toStatus: 'In Progress' },
		]

		const mockExtractStatusChanges = jest.spyOn(statusChanges, 'extractStatusChanges')
		mockExtractStatusChanges.mockReturnValue(mockStatusChanges)

		const mockCalculateActiveTime = jest.spyOn(statusChanges, 'calculateActiveTimeFromStatusChanges')
		mockCalculateActiveTime.mockReturnValue(15000)

		// Execute
		const result = calculateActiveWorkTime(mockIssue)

		// Verify
		expect(mockExtractStatusChanges).toHaveBeenCalledWith(mockIssue)
		expect(mockCalculateActiveTime).toHaveBeenCalledWith(mockIssue, mockStatusChanges)
		expect(result).toBe(15000)
	})
})
