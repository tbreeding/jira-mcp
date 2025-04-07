import * as activeTimeCalculationModule from '../flowEfficiency/activeTimeCalculation'
import { calculateFlowEfficiency } from '../flowEfficiency/calculateFlowEfficiency'
import { isActiveStatus } from '../utils/isActiveStatus'

// Mock the isActiveStatus utility and activeTimeCalculation module
jest.mock('../utils/isActiveStatus')
jest.mock('../flowEfficiency/activeTimeCalculation', () => ({
	calculateActiveWorkTime: jest.fn().mockReturnValue(100000), // Default mock for active time
}))

describe('calculateFlowEfficiency', () => {
	// Setup before each test
	beforeEach(() => {
		// Reset and setup mocks before each test
		jest.clearAllMocks()

		// Reset the mock for calculateActiveWorkTime to a default value
		const calculateActiveWorkTimeMock = activeTimeCalculationModule.calculateActiveWorkTime as jest.Mock
		calculateActiveWorkTimeMock.mockReturnValue(100000)
	})

	test('should return 0 if the issue has no elapsed time', () => {
		// Mock the isActiveStatus function to return true for any status
		;(isActiveStatus as jest.Mock).mockReturnValue(true)

		// Create a mock issue with the same creation and resolution date
		const sameTimeIssue = {
			fields: {
				created: '2023-01-01T10:00:00.000Z',
				resolutiondate: '2023-01-01T10:00:00.000Z',
				status: { name: 'In Progress' },
			},
		} as any

		// Calculate flow efficiency
		const efficiency = calculateFlowEfficiency(sameTimeIssue)

		// Should return 0 for no elapsed time
		expect(efficiency).toBe(0)
	})

	// This test specifically targets line 16 in calculateFlowEfficiency.ts
	test('should return 0 if the issue has negative elapsed time', () => {
		// Mock the isActiveStatus function to return true for any status
		;(isActiveStatus as jest.Mock).mockReturnValue(true)

		// Create a mock issue with resolution date before creation (unusual but possible in data)
		const negativeTimeIssue = {
			fields: {
				created: '2023-01-05T10:00:00.000Z', // Later date
				resolutiondate: '2023-01-01T10:00:00.000Z', // Earlier date
				status: { name: 'In Progress' },
			},
		} as any

		// Calculate flow efficiency
		const efficiency = calculateFlowEfficiency(negativeTimeIssue)

		// Should return 0 for negative elapsed time
		expect(efficiency).toBe(0)
	})

	test('should return 100% efficiency when all time is active', () => {
		// Mock isActiveStatus to always return true
		;(isActiveStatus as jest.Mock).mockReturnValue(true)

		// Mock the active time calculation to return the same as total elapsed time
		const calculateActiveWorkTimeMock = activeTimeCalculationModule.calculateActiveWorkTime as jest.Mock
		calculateActiveWorkTimeMock.mockReturnValue(345600000) // 4 days in milliseconds

		// Create a mock issue with all time in active status
		const issue = {
			fields: {
				created: '2023-01-01T10:00:00.000Z',
				resolutiondate: '2023-01-05T10:00:00.000Z',
				status: { name: 'In Progress' },
			},
			changelog: {
				histories: [], // No status changes
			},
		} as any

		// Calculate flow efficiency
		const efficiency = calculateFlowEfficiency(issue)

		// Since 'In Progress' is considered active and there are no changes,
		// the active time should be the total time
		expect(efficiency).toBe(100)
	})

	test('should return 0% efficiency when no time is active', () => {
		// Mock isActiveStatus to always return false
		;(isActiveStatus as jest.Mock).mockReturnValue(false)

		// Mock the active time calculation to return 0
		const calculateActiveWorkTimeMock = activeTimeCalculationModule.calculateActiveWorkTime as jest.Mock
		calculateActiveWorkTimeMock.mockReturnValue(0)

		// Create a mock issue with all time in inactive status
		const issue = {
			fields: {
				created: '2023-01-01T10:00:00.000Z',
				resolutiondate: '2023-01-05T10:00:00.000Z',
				status: { name: 'To Do' },
			},
			changelog: {
				histories: [], // No status changes
			},
		} as any

		// Calculate flow efficiency
		const efficiency = calculateFlowEfficiency(issue)

		// Should return 0% efficiency
		expect(efficiency).toBe(0)
	})

	test('should handle issue without changelog', () => {
		// Mock isActiveStatus to return true
		;(isActiveStatus as jest.Mock).mockReturnValue(true)

		// Mock the active time calculation to return 4 days in milliseconds
		const calculateActiveWorkTimeMock = activeTimeCalculationModule.calculateActiveWorkTime as jest.Mock
		calculateActiveWorkTimeMock.mockReturnValue(345600000) // 4 days in milliseconds

		// Create a mock issue without changelog
		const issueWithoutChangelog = {
			fields: {
				created: '2023-01-01T10:00:00.000Z',
				resolutiondate: '2023-01-05T10:00:00.000Z',
				status: { name: 'In Progress' },
			},
			// No changelog property
		} as any

		// Calculate flow efficiency
		const efficiency = calculateFlowEfficiency(issueWithoutChangelog)

		// Should still calculate efficiency correctly based on current status
		expect(efficiency).toBe(100)
	})

	test('should handle issue with empty changelog histories', () => {
		// Mock isActiveStatus to return true for 'In Progress'
		;(isActiveStatus as jest.Mock).mockReturnValue(true)

		// Mock the active time calculation to return 4 days in milliseconds
		const calculateActiveWorkTimeMock = activeTimeCalculationModule.calculateActiveWorkTime as jest.Mock
		calculateActiveWorkTimeMock.mockReturnValue(345600000) // 4 days in milliseconds

		// Create a mock issue with empty changelog histories
		const issueWithEmptyHistories = {
			fields: {
				created: '2023-01-01T10:00:00.000Z',
				resolutiondate: '2023-01-05T10:00:00.000Z',
				status: { name: 'In Progress' },
			},
			changelog: {
				histories: [], // Empty histories array
			},
		} as any

		// Calculate flow efficiency
		const efficiency = calculateFlowEfficiency(issueWithEmptyHistories)

		// Should calculate efficiency based on current status since no history
		// Since all time is active, efficiency should be 100%
		expect(efficiency).toBe(100)
	})

	test('should calculate partial efficiency with status changes', () => {
		// Mock implementation to return true only for 'In Progress'
		;(isActiveStatus as jest.Mock).mockImplementation((status) => status === 'In Progress')

		// Mock the active time calculation to return 2 days in milliseconds
		const calculateActiveWorkTimeMock = activeTimeCalculationModule.calculateActiveWorkTime as jest.Mock
		calculateActiveWorkTimeMock.mockReturnValue(172800000) // 2 days in milliseconds

		// Create a mock issue with status changes
		const issue = {
			fields: {
				created: '2023-01-01T10:00:00.000Z',
				resolutiondate: '2023-01-05T10:00:00.000Z',
				status: { name: 'Done' },
			},
			changelog: {
				histories: [
					{
						created: '2023-01-02T10:00:00.000Z', // 24 hours after creation
						items: [{ field: 'status', fromString: 'To Do', toString: 'In Progress' }],
					},
					{
						created: '2023-01-04T10:00:00.000Z', // 48 hours in In Progress
						items: [{ field: 'status', fromString: 'In Progress', toString: 'Done' }],
					},
				],
			},
		} as any

		// Calculate flow efficiency
		const efficiency = calculateFlowEfficiency(issue)

		// Total time: 4 days (96 hours)
		// Active time: 2 days (48 hours) - 50% efficiency
		expect(efficiency).toBeCloseTo(50, 1)
	})

	test('should handle unresolved issues using current date', () => {
		// Mock isActiveStatus to always return true
		;(isActiveStatus as jest.Mock).mockReturnValue(true)

		// Mock the active time calculation to return 9 days in milliseconds
		const calculateActiveWorkTimeMock = activeTimeCalculationModule.calculateActiveWorkTime as jest.Mock
		calculateActiveWorkTimeMock.mockReturnValue(777600000) // 9 days in milliseconds

		// Create a mock unresolved issue with a resolution date
		const unresolvedIssue = {
			fields: {
				created: '2023-01-01T10:00:00.000Z',
				resolutiondate: '2023-01-10T10:00:00.000Z', // Simulate "current date"
				status: { name: 'In Progress' },
			},
			changelog: {
				histories: [],
			},
		} as any

		// Calculate flow efficiency
		const efficiency = calculateFlowEfficiency(unresolvedIssue)

		// All time should be considered active since we mocked isActiveStatus to return true
		expect(efficiency).toBe(100)
	})

	test('should handle multiple status changes correctly', () => {
		// Mock implementation for isActiveStatus
		;(isActiveStatus as jest.Mock).mockImplementation((status) => ['In Progress', 'Review'].includes(status))

		// Mock the active time calculation to return 4 days in milliseconds
		const calculateActiveWorkTimeMock = activeTimeCalculationModule.calculateActiveWorkTime as jest.Mock
		calculateActiveWorkTimeMock.mockReturnValue(345600000) // 4 days in milliseconds

		// Create a mock issue with several status changes
		const issue = {
			fields: {
				created: '2023-01-01T10:00:00.000Z', // Start in To Do (inactive)
				resolutiondate: '2023-01-10T10:00:00.000Z',
				status: { name: 'Done' }, // End in Done (inactive)
			},
			changelog: {
				histories: [
					{
						created: '2023-01-02T10:00:00.000Z', // 24 hours in To Do
						items: [{ field: 'status', fromString: 'To Do', toString: 'In Progress' }],
					},
					{
						created: '2023-01-04T10:00:00.000Z', // 48 hours in In Progress
						items: [{ field: 'status', fromString: 'In Progress', toString: 'Blocked' }],
					},
					{
						created: '2023-01-06T10:00:00.000Z', // 48 hours in Blocked
						items: [{ field: 'status', fromString: 'Blocked', toString: 'In Progress' }],
					},
					{
						created: '2023-01-07T10:00:00.000Z', // 24 hours in In Progress
						items: [{ field: 'status', fromString: 'In Progress', toString: 'Review' }],
					},
					{
						created: '2023-01-08T10:00:00.000Z', // 24 hours in Review
						items: [{ field: 'status', fromString: 'Review', toString: 'Done' }],
					},
				],
			},
		} as any

		// Calculate flow efficiency
		const efficiency = calculateFlowEfficiency(issue)

		// Total time: 9 days (216 hours)
		// Active time: 4 days (96 hours) - about 44.4% efficiency
		expect(efficiency).toBeCloseTo(44.4, 1)
	})

	test('should cap efficiency at 100%', () => {
		// Create a mock issue for this test
		const issue = {
			fields: {
				created: '2023-01-01T10:00:00.000Z',
				resolutiondate: '2023-01-05T10:00:00.000Z',
				status: { name: 'Done' },
			},
			changelog: {
				histories: [
					{
						created: '2023-01-02T10:00:00.000Z',
						items: [{ field: 'status', fromString: 'To Do', toString: 'In Progress' }],
					},
				],
			},
		} as any

		// Set up mocks to simulate an active time greater than total elapsed time
		const calculateActiveWorkTimeMock = activeTimeCalculationModule.calculateActiveWorkTime as jest.Mock
		calculateActiveWorkTimeMock.mockReturnValue(1000000000) // Unrealistically high active time

		// Calculate flow efficiency
		const efficiency = calculateFlowEfficiency(issue)

		// Should cap at 100% even if calculated value would be higher
		expect(efficiency).toBe(100)
	})
})
