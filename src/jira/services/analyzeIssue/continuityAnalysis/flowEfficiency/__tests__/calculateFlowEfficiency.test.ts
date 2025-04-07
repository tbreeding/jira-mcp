import * as activeTimeCalculationModule from '../activeTimeCalculation'
import { calculateFlowEfficiency } from '../calculateFlowEfficiency'
import type { JiraIssue } from '../../../../../types/issue.types'

// Mock the dependencies
jest.mock('../activeTimeCalculation', () => ({
	calculateActiveWorkTime: jest.fn(),
}))

describe('calculateFlowEfficiency', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('should return 0 if total elapsed time is zero', () => {
		// Setup mock issue with same creation and resolution date
		const mockIssue = {
			fields: {
				created: '2023-01-01T10:00:00.000Z',
				resolutiondate: '2023-01-01T10:00:00.000Z',
				status: { name: 'Done' },
			},
		} as unknown as JiraIssue

		// Mock active time calculation
		;(activeTimeCalculationModule.calculateActiveWorkTime as jest.Mock).mockReturnValue(100000)

		// Call function
		const result = calculateFlowEfficiency(mockIssue)

		// Verify
		expect(result).toBe(0)
		// The active time calculation should not be called at all since we short circuit
		expect(activeTimeCalculationModule.calculateActiveWorkTime).not.toHaveBeenCalled()
	})

	test('should return 0 if total elapsed time is negative', () => {
		// Setup mock issue with resolution date before creation date (unusual edge case)
		const mockIssue = {
			fields: {
				created: '2023-01-02T10:00:00.000Z',
				resolutiondate: '2023-01-01T10:00:00.000Z',
				status: { name: 'Done' },
			},
		} as unknown as JiraIssue

		// Mock active time calculation
		;(activeTimeCalculationModule.calculateActiveWorkTime as jest.Mock).mockReturnValue(100000)

		// Call function
		const result = calculateFlowEfficiency(mockIssue)

		// Verify
		expect(result).toBe(0)
		// The active time calculation should not be called at all since we short circuit
		expect(activeTimeCalculationModule.calculateActiveWorkTime).not.toHaveBeenCalled()
	})

	test('should calculate flow efficiency correctly for a resolved issue', () => {
		// Setup mock issue
		const mockIssue = {
			fields: {
				created: '2023-01-01T10:00:00.000Z',
				resolutiondate: '2023-01-05T10:00:00.000Z',
				status: { name: 'Done' },
			},
		} as unknown as JiraIssue

		// Mock active time calculation - 2 days of active time
		const activeTime = 172800000 // 2 days in ms
		;(activeTimeCalculationModule.calculateActiveWorkTime as jest.Mock).mockReturnValue(activeTime)

		// Call function
		const result = calculateFlowEfficiency(mockIssue)

		// Total elapsed time: 4 days (345600000 ms)
		// Active time: 2 days (172800000 ms)
		// Expected efficiency: 50%
		expect(result).toBeCloseTo(50, 1)
		expect(activeTimeCalculationModule.calculateActiveWorkTime).toHaveBeenCalledWith(mockIssue)
	})

	test('should use current date if issue is not resolved', () => {
		// Setup mock issue without resolution date
		const mockCreationDate = '2023-01-01T10:00:00.000Z'
		const mockCurrentDate = new Date(mockCreationDate).getTime() + 1000000

		const mockIssue = {
			fields: {
				created: mockCreationDate,
				// No resolutiondate
				status: { name: 'In Progress' },
			},
		} as unknown as JiraIssue

		// Mock active time calculation - set to a more realistic proportion of the time
		const activeTime = 10000 // Very small active time value
		;(activeTimeCalculationModule.calculateActiveWorkTime as jest.Mock).mockReturnValue(activeTime)

		// Use fake timers to set current date
		jest.useFakeTimers()
		jest.setSystemTime(new Date(mockCurrentDate))

		try {
			// Call function
			const result = calculateFlowEfficiency(mockIssue)

			// Active time is 10000 and total elapsed time is 1000000, so efficiency should be 1%
			expect(result).toBeCloseTo(1, 1)
			expect(activeTimeCalculationModule.calculateActiveWorkTime).toHaveBeenCalledWith(mockIssue)
		} finally {
			// Restore real timers
			jest.useRealTimers()
		}
	})

	test('should cap efficiency at 100%', () => {
		// Setup mock issue
		const mockIssue = {
			fields: {
				created: '2023-01-01T10:00:00.000Z',
				resolutiondate: '2023-01-05T10:00:00.000Z',
				status: { name: 'Done' },
			},
		} as unknown as JiraIssue

		// Mock active time calculation - return more active time than elapsed time (unrealistic)
		const activeTime = 432000000 // 5 days in ms (more than the 4 days elapsed)
		;(activeTimeCalculationModule.calculateActiveWorkTime as jest.Mock).mockReturnValue(activeTime)

		// Call function
		const result = calculateFlowEfficiency(mockIssue)

		// Should cap at 100% despite active time being more than elapsed time
		expect(result).toBe(100)
		expect(activeTimeCalculationModule.calculateActiveWorkTime).toHaveBeenCalledWith(mockIssue)
	})

	test('should ensure efficiency is not negative', () => {
		// Setup mock issue
		const mockIssue = {
			fields: {
				created: '2023-01-01T10:00:00.000Z',
				resolutiondate: '2023-01-05T10:00:00.000Z',
				status: { name: 'Done' },
			},
		} as unknown as JiraIssue

		// Mock active time calculation - negative time (impossible in reality)
		const activeTime = -86400000 // -1 day in ms
		;(activeTimeCalculationModule.calculateActiveWorkTime as jest.Mock).mockReturnValue(activeTime)

		// Call function
		const result = calculateFlowEfficiency(mockIssue)

		// Should ensure efficiency is not negative
		expect(result).toBe(0)
		expect(activeTimeCalculationModule.calculateActiveWorkTime).toHaveBeenCalledWith(mockIssue)
	})
})
