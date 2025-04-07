import { isActiveStatus } from '../../utils/isActiveStatus'
import { initializeState, updateState } from '../stateManagement'

// Mock the dependency
jest.mock('../../utils/isActiveStatus')

describe('flowEfficiency state management', () => {
	// Reset mocks before each test
	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe('initializeState', () => {
		test('should initialize state with valid status from issue', () => {
			// Setup mock
			;(isActiveStatus as jest.Mock).mockReturnValue(true)

			// Create issue with valid status
			const issue = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					status: { name: 'In Progress' },
				},
			} as unknown as any

			// Call the function
			const state = initializeState(issue)

			// Verify results
			expect(state).toEqual({
				currentDate: new Date('2023-01-01T00:00:00.000Z'),
				currentStatus: 'In Progress',
				inActiveStatus: true,
			})
			expect(isActiveStatus).toHaveBeenCalledWith('In Progress')
		})

		test('should initialize state with inactive status', () => {
			// Setup mock
			;(isActiveStatus as jest.Mock).mockReturnValue(false)

			// Create issue with inactive status
			const issue = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					status: { name: 'To Do' },
				},
			} as unknown as any

			// Call the function
			const state = initializeState(issue)

			// Verify results
			expect(state).toEqual({
				currentDate: new Date('2023-01-01T00:00:00.000Z'),
				currentStatus: 'To Do',
				inActiveStatus: false,
			})
			expect(isActiveStatus).toHaveBeenCalledWith('To Do')
		})

		test('should handle null status in issue', () => {
			// Create issue with null status
			const issue = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					status: null,
				},
			} as unknown as any

			// Call the function
			const state = initializeState(issue)

			// Verify results
			expect(state).toEqual({
				currentDate: new Date('2023-01-01T00:00:00.000Z'),
				currentStatus: null,
				inActiveStatus: false,
			})
			expect(isActiveStatus).not.toHaveBeenCalled()
		})

		test('should handle undefined status in issue', () => {
			// Create issue with undefined status
			const issue = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					// status is undefined
				},
			} as unknown as any

			// Call the function
			const state = initializeState(issue)

			// Verify results
			expect(state).toEqual({
				currentDate: new Date('2023-01-01T00:00:00.000Z'),
				currentStatus: null,
				inActiveStatus: false,
			})
			expect(isActiveStatus).not.toHaveBeenCalled()
		})
	})

	describe('updateState', () => {
		test('should update state with valid status change', () => {
			// Setup mock
			;(isActiveStatus as jest.Mock).mockReturnValue(true)

			// Create status change event
			const change = {
				date: new Date('2023-01-02T00:00:00.000Z'),
				fromStatus: 'To Do',
				toStatus: 'In Progress',
			}

			// Call the function
			const state = updateState(change)

			// Verify results
			expect(state).toEqual({
				currentDate: new Date('2023-01-02T00:00:00.000Z'),
				currentStatus: 'In Progress',
				inActiveStatus: true,
			})
			expect(isActiveStatus).toHaveBeenCalledWith('In Progress')
		})

		test('should update state with inactive status', () => {
			// Setup mock
			;(isActiveStatus as jest.Mock).mockReturnValue(false)

			// Create status change event
			const change = {
				date: new Date('2023-01-02T00:00:00.000Z'),
				fromStatus: 'In Progress',
				toStatus: 'Done',
			}

			// Call the function
			const state = updateState(change)

			// Verify results
			expect(state).toEqual({
				currentDate: new Date('2023-01-02T00:00:00.000Z'),
				currentStatus: 'Done',
				inActiveStatus: false,
			})
			expect(isActiveStatus).toHaveBeenCalledWith('Done')
		})

		test('should handle null toStatus', () => {
			// Create status change event with null toStatus
			const change = {
				date: new Date('2023-01-02T00:00:00.000Z'),
				fromStatus: 'In Progress',
				toStatus: null,
			}

			// Call the function
			const state = updateState(change)

			// Verify results
			expect(state).toEqual({
				currentDate: new Date('2023-01-02T00:00:00.000Z'),
				currentStatus: null,
				inActiveStatus: false,
			})
			expect(isActiveStatus).not.toHaveBeenCalled()
		})
	})
})
