import { isActiveStatus } from '../../utils/isActiveStatus'
import { handleIssueWithoutHistory } from '../historyHandling'

// Mock dependencies
jest.mock('../../utils/isActiveStatus')

describe('historyHandling', () => {
	// Setup fixed date for testing
	const fixedDate = new Date('2023-01-10T00:00:00.000Z')

	// Reset mocks before each test
	beforeEach(() => {
		jest.clearAllMocks()
		// Use this approach to mock Date constructor
		jest.useFakeTimers().setSystemTime(fixedDate)
	})

	afterEach(() => {
		jest.useRealTimers()
	})

	describe('handleIssueWithoutHistory', () => {
		test('should return active time when status is active and issue is resolved', () => {
			// Mock isActiveStatus to return true
			;(isActiveStatus as jest.Mock).mockReturnValue(true)

			const issue = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					resolutiondate: '2023-01-05T00:00:00.000Z',
					status: { name: 'In Progress' },
				},
			} as any

			const result = handleIssueWithoutHistory(issue)

			// 4 days in milliseconds (Jan 1 to Jan 5)
			const expectedTime =
				new Date('2023-01-05T00:00:00.000Z').getTime() - new Date('2023-01-01T00:00:00.000Z').getTime()

			expect(result).toBe(expectedTime)
			expect(isActiveStatus).toHaveBeenCalledWith('In Progress')
		})

		test('should return active time when status is active and issue is not resolved', () => {
			// Mock isActiveStatus to return true
			;(isActiveStatus as jest.Mock).mockReturnValue(true)

			const issue = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					// No resolutiondate
					status: { name: 'In Progress' },
				},
			} as any

			const result = handleIssueWithoutHistory(issue)

			// 9 days in milliseconds (Jan 1 to Jan 10, our mocked current date)
			const expectedTime = fixedDate.getTime() - new Date('2023-01-01T00:00:00.000Z').getTime()

			expect(result).toBe(expectedTime)
			expect(isActiveStatus).toHaveBeenCalledWith('In Progress')
		})

		test('should return 0 when status is inactive', () => {
			// Mock isActiveStatus to return false
			;(isActiveStatus as jest.Mock).mockReturnValue(false)

			const issue = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					resolutiondate: '2023-01-05T00:00:00.000Z',
					status: { name: 'To Do' },
				},
			} as any

			const result = handleIssueWithoutHistory(issue)

			expect(result).toBe(0)
			expect(isActiveStatus).toHaveBeenCalledWith('To Do')
		})

		test('should return 0 when status is missing or undefined', () => {
			// This test specifically covers line 22 in historyHandling.ts
			const issueWithoutStatus = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					// No status field
				},
			} as any

			const result = handleIssueWithoutHistory(issueWithoutStatus)

			expect(result).toBe(0)
			expect(isActiveStatus).not.toHaveBeenCalled()
		})

		test('should return 0 when status.name is missing', () => {
			// This test also helps cover line 22 in historyHandling.ts
			const issueWithEmptyStatus = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					status: {}, // Status object without name property
				},
			} as any

			const result = handleIssueWithoutHistory(issueWithEmptyStatus)

			expect(result).toBe(0)
			expect(isActiveStatus).not.toHaveBeenCalled()
		})

		test('should use current date when resolutiondate is not a string', () => {
			// This test specifically covers line 27 in historyHandling.ts
			// Mock isActiveStatus to return true
			;(isActiveStatus as jest.Mock).mockReturnValue(true)

			const issueWithNonStringResolution = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					resolutiondate: {}, // Not a string
					status: { name: 'In Progress' },
				},
			} as any

			const result = handleIssueWithoutHistory(issueWithNonStringResolution)

			// Should use current date (our mocked Jan 10) instead of resolution date
			const expectedTime = fixedDate.getTime() - new Date('2023-01-01T00:00:00.000Z').getTime()

			expect(result).toBe(expectedTime)
			expect(isActiveStatus).toHaveBeenCalledWith('In Progress')
		})

		test('should use current date when resolutiondate is null', () => {
			// This also helps cover line 27
			// Mock isActiveStatus to return true
			;(isActiveStatus as jest.Mock).mockReturnValue(true)

			const issueWithNullResolution = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					resolutiondate: null,
					status: { name: 'In Progress' },
				},
			} as any

			const result = handleIssueWithoutHistory(issueWithNullResolution)

			// Should use current date instead of resolution date
			const expectedTime = fixedDate.getTime() - new Date('2023-01-01T00:00:00.000Z').getTime()

			expect(result).toBe(expectedTime)
		})
	})
})
