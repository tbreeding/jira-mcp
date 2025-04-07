import { identifyCommunicationGaps } from '../communicationGaps/identifyCommunicationGaps'
import { analyzeContextSwitches } from '../contextSwitches/analyzeContextSwitches'
import { calculateFeedbackResponseTime } from '../feedbackResponseTime/calculateFeedbackResponseTime'
import { calculateFlowEfficiency } from '../flowEfficiency/calculateFlowEfficiency'
import { getContinuityAnalysis } from '../getContinuityAnalysis'
import { identifyLateStageChanges } from '../lateStageChanges/identifyLateStageChanges'
import { analyzeMomentumIndicators } from '../momentumIndicators/analyzeMomentumIndicators'
import { identifyStagnationPeriods } from '../stagnationPeriods/identifyStagnationPeriods'
import { analyzeWorkFragmentation } from '../workFragmentation/analyzeWorkFragmentation'

// Mock all the dependencies
jest.mock('../flowEfficiency/calculateFlowEfficiency')
jest.mock('../stagnationPeriods/identifyStagnationPeriods')
jest.mock('../communicationGaps/identifyCommunicationGaps')
jest.mock('../contextSwitches/analyzeContextSwitches')
jest.mock('../momentumIndicators/analyzeMomentumIndicators')
jest.mock('../workFragmentation/analyzeWorkFragmentation')
jest.mock('../lateStageChanges/identifyLateStageChanges')
jest.mock('../feedbackResponseTime/calculateFeedbackResponseTime')

describe('getContinuityAnalysis', () => {
	// Setup mock return values
	const mockFlowEfficiency = 0.75
	const mockStagnationPeriods = [
		{ startDate: '2023-01-01', endDate: '2023-01-03', durationDays: 2, status: 'To Do', assignee: 'user1' },
	]
	const mockLongestStagnationPeriod = 2
	const mockCommunicationGaps = [{ startDate: '2023-01-05', endDate: '2023-01-07', durationDays: 2 }]
	const mockContextSwitches = {
		count: 1,
		timing: [
			{ date: '2023-01-10', fromAssignee: 'user1', toAssignee: 'user2', status: 'In Progress', daysFromStart: 10 },
		],
		impact: 'Low',
	}
	const mockMomentumScore = 0.8
	const mockWorkFragmentation = {
		fragmentationScore: 0.3,
		activeWorkPeriods: 2,
	}
	const mockLateStageChanges = [
		{ date: '2023-01-20', field: 'description', description: 'Changed requirements', percentComplete: 80 },
	]
	const mockFeedbackResponseTime = 4.5

	// Mock issue and comments
	const mockIssue = { id: '123', fields: {} } as any
	const mockCommentsResponse = { comments: [] } as any

	beforeEach(() => {
		// Reset and setup mocks before each test
		jest.clearAllMocks()
		;(calculateFlowEfficiency as jest.Mock).mockReturnValue(mockFlowEfficiency)
		;(identifyStagnationPeriods as jest.Mock).mockReturnValue(mockStagnationPeriods)
		;(identifyCommunicationGaps as jest.Mock).mockReturnValue(mockCommunicationGaps)
		;(analyzeContextSwitches as jest.Mock).mockReturnValue(mockContextSwitches)
		;(analyzeMomentumIndicators as jest.Mock).mockReturnValue(mockMomentumScore)
		;(analyzeWorkFragmentation as jest.Mock).mockReturnValue(mockWorkFragmentation)
		;(identifyLateStageChanges as jest.Mock).mockReturnValue(mockLateStageChanges)
		;(calculateFeedbackResponseTime as jest.Mock).mockReturnValue(mockFeedbackResponseTime)
	})

	test('should call all analysis functions with correct parameters', () => {
		// Call the function
		getContinuityAnalysis(mockIssue, mockCommentsResponse)

		// Verify each function is called with correct parameters
		expect(calculateFlowEfficiency).toHaveBeenCalledWith(mockIssue)
		expect(identifyStagnationPeriods).toHaveBeenCalledWith(mockIssue)
		expect(identifyCommunicationGaps).toHaveBeenCalledWith(mockIssue, mockCommentsResponse)
		expect(analyzeContextSwitches).toHaveBeenCalledWith(mockIssue)
		expect(analyzeMomentumIndicators).toHaveBeenCalledWith(mockIssue, mockCommentsResponse, mockStagnationPeriods)
		expect(analyzeWorkFragmentation).toHaveBeenCalledWith(mockIssue)
		expect(identifyLateStageChanges).toHaveBeenCalledWith(mockIssue)
		expect(calculateFeedbackResponseTime).toHaveBeenCalledWith(mockCommentsResponse)
	})

	test('should return correctly structured continuity analysis', () => {
		// Call the function
		const result = getContinuityAnalysis(mockIssue, mockCommentsResponse)

		// Verify the structure and content of the result
		expect(result).toEqual({
			flowEfficiency: mockFlowEfficiency,
			stagnationPeriods: mockStagnationPeriods,
			longestStagnationPeriod: mockLongestStagnationPeriod,
			communicationGaps: mockCommunicationGaps,
			contextSwitches: mockContextSwitches,
			momentumScore: mockMomentumScore,
			workFragmentation: mockWorkFragmentation,
			lateStageChanges: mockLateStageChanges,
			feedbackResponseTime: mockFeedbackResponseTime,
		})
	})

	test('should calculate longest stagnation period correctly when stagnation periods exist', () => {
		// Setup different durations for testing max calculation
		const periodsWithDifferentDurations = [
			{ startDate: '2023-01-01', endDate: '2023-01-03', durationDays: 2, status: 'To Do', assignee: 'user1' },
			{ startDate: '2023-01-10', endDate: '2023-01-15', durationDays: 5, status: 'Review', assignee: 'user2' },
			{ startDate: '2023-01-20', endDate: '2023-01-22', durationDays: 3, status: 'Blocked', assignee: 'user1' },
		]

		;(identifyStagnationPeriods as jest.Mock).mockReturnValue(periodsWithDifferentDurations)

		// Call the function
		const result = getContinuityAnalysis(mockIssue, mockCommentsResponse)

		// Verify that the longest stagnation period is calculated correctly
		expect(result.longestStagnationPeriod).toBe(5)
	})

	test('should set longest stagnation period to 0 when no stagnation periods exist', () => {
		// Setup empty stagnation periods
		;(identifyStagnationPeriods as jest.Mock).mockReturnValue([])

		// Call the function
		const result = getContinuityAnalysis(mockIssue, mockCommentsResponse)

		// Verify that the longest stagnation period is 0
		expect(result.longestStagnationPeriod).toBe(0)
	})
})
