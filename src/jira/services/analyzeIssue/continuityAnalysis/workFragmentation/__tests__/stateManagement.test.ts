import { isInitialStatusActive } from '../../utils/status/isInitialStatusActive'
import { getInitialState, createNewState } from '../stateManagement'
import type { JiraIssue } from '../../../../../types/issue.types'

// Mock dependencies
jest.mock('../../utils/status/isInitialStatusActive')

// Create cast mock variables
const mockIsInitialStatusActive = isInitialStatusActive as jest.Mock

describe('stateManagement', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe('getInitialState', () => {
		test('should return initial state with active status', () => {
			// Arrange
			const issue = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					status: { name: 'In Progress' },
					assignee: { displayName: 'User 1' },
				},
			} as unknown as JiraIssue

			// Mock isInitialStatusActive to return true
			mockIsInitialStatusActive.mockReturnValue(true)

			// Act
			const result = getInitialState(issue)

			// Assert
			expect(result).toEqual({
				currentDate: new Date('2023-01-01T00:00:00.000Z'),
				currentStatus: 'In Progress',
				currentAssignee: 'User 1',
				inActiveStatus: true,
				activePeriodStart: new Date('2023-01-01T00:00:00.000Z'),
			})

			// Verify isInitialStatusActive was called correctly
			expect(mockIsInitialStatusActive).toHaveBeenCalledWith('In Progress')
		})

		test('should return initial state with inactive status', () => {
			// Arrange
			const issue = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					status: { name: 'To Do' },
					assignee: { displayName: 'User 1' },
				},
			} as unknown as JiraIssue

			// Mock isInitialStatusActive to return false
			mockIsInitialStatusActive.mockReturnValue(false)

			// Act
			const result = getInitialState(issue)

			// Assert
			expect(result).toEqual({
				currentDate: new Date('2023-01-01T00:00:00.000Z'),
				currentStatus: 'To Do',
				currentAssignee: 'User 1',
				inActiveStatus: false,
				activePeriodStart: null,
			})

			// Verify isInitialStatusActive was called correctly
			expect(mockIsInitialStatusActive).toHaveBeenCalledWith('To Do')
		})

		test('should handle missing status and assignee', () => {
			// Arrange
			const issue = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					status: null,
					assignee: null,
				},
			} as unknown as JiraIssue

			// Mock isInitialStatusActive to return false
			mockIsInitialStatusActive.mockReturnValue(false)

			// Act
			const result = getInitialState(issue)

			// Assert
			expect(result).toEqual({
				currentDate: new Date('2023-01-01T00:00:00.000Z'),
				currentStatus: null,
				currentAssignee: null,
				inActiveStatus: false,
				activePeriodStart: null,
			})

			// Verify isInitialStatusActive was called correctly
			expect(mockIsInitialStatusActive).toHaveBeenCalledWith(null)
		})
	})

	describe('createNewState', () => {
		test('should create new state with updated values', () => {
			// Arrange
			const change = {
				date: new Date('2023-01-02T00:00:00.000Z'),
				toStatus: 'In Progress',
				assignee: 'User 2',
			}
			const currentStatus = 'To Do'
			const currentAssignee = 'User 1'
			const newInActiveStatus = true
			const newActivePeriodStart = new Date('2023-01-02T00:00:00.000Z')

			// Act
			const result = createNewState(change, currentStatus, currentAssignee, newInActiveStatus, newActivePeriodStart)

			// Assert
			expect(result).toEqual({
				currentDate: new Date('2023-01-02T00:00:00.000Z'),
				currentStatus: 'In Progress',
				currentAssignee: 'User 2',
				inActiveStatus: true,
				activePeriodStart: new Date('2023-01-02T00:00:00.000Z'),
			})
		})

		test('should fallback to current values when change values are null', () => {
			// Arrange
			const change = {
				date: new Date('2023-01-02T00:00:00.000Z'),
				toStatus: null,
				assignee: null,
			}
			const currentStatus = 'In Progress'
			const currentAssignee = 'User 1'
			const newInActiveStatus = true
			const newActivePeriodStart = new Date('2023-01-01T00:00:00.000Z')

			// Act
			const result = createNewState(change, currentStatus, currentAssignee, newInActiveStatus, newActivePeriodStart)

			// Assert
			expect(result).toEqual({
				currentDate: new Date('2023-01-02T00:00:00.000Z'),
				currentStatus: 'In Progress',
				currentAssignee: 'User 1',
				inActiveStatus: true,
				activePeriodStart: new Date('2023-01-01T00:00:00.000Z'),
			})
		})

		test('should handle all null values', () => {
			// Arrange
			const change = {
				date: new Date('2023-01-02T00:00:00.000Z'),
				toStatus: null,
				assignee: null,
			}
			const currentStatus = null
			const currentAssignee = null
			const newInActiveStatus = false
			const newActivePeriodStart = null

			// Act
			const result = createNewState(change, currentStatus, currentAssignee, newInActiveStatus, newActivePeriodStart)

			// Assert
			expect(result).toEqual({
				currentDate: new Date('2023-01-02T00:00:00.000Z'),
				currentStatus: null,
				currentAssignee: null,
				inActiveStatus: false,
				activePeriodStart: null,
			})
		})
	})
})
