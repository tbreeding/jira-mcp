import { analyzeComments } from '../analyzeComments'
import { analyzeComponentTouchpoints } from '../analyzeComponentTouchpoints'
import { analyzeEstimationChanges } from '../analyzeEstimationChanges'
import { analyzeFieldModifications } from '../analyzeFieldModifications'
import { analyzeLinkedIssues } from '../analyzeLinkedIssues'
import { analyzeTechnicalComplexity } from '../analyzeTechnicalComplexity'
import { countAssigneeChanges } from '../countAssigneeChanges'
import { determineComplexityLevel } from '../determineComplexityLevel'
import { getComplexityAnalysis } from '../getComplexityAnalysis'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'

// Mock all the analyzer functions
jest.mock('../analyzeTechnicalComplexity')
jest.mock('../analyzeLinkedIssues')
jest.mock('../analyzeComments')
jest.mock('../countAssigneeChanges')
jest.mock('../analyzeEstimationChanges')
jest.mock('../analyzeFieldModifications')
jest.mock('../analyzeComponentTouchpoints')
jest.mock('../determineComplexityLevel')

describe('getComplexityAnalysis', () => {
	let mockIssue: JiraIssue
	let mockCommentsResponse: IssueCommentResponse

	beforeEach(() => {
		// Create minimal mock objects
		mockIssue = { key: 'TEST-123' } as JiraIssue
		mockCommentsResponse = {
			comments: [],
			startAt: 0,
			maxResults: 0,
			total: 0,
		} as IssueCommentResponse

		// Reset all mocks
		jest.resetAllMocks()

		// Setup default mock return values
		const mockAnalyzeTechnicalComplexity = analyzeTechnicalComplexity as jest.MockedFunction<
			typeof analyzeTechnicalComplexity
		>
		mockAnalyzeTechnicalComplexity.mockReturnValue({ score: 1, factor: 'Technical factor' })

		const mockAnalyzeLinkedIssues = analyzeLinkedIssues as jest.MockedFunction<typeof analyzeLinkedIssues>
		mockAnalyzeLinkedIssues.mockReturnValue({ score: 1, factor: 'Linked issues factor' })

		const mockAnalyzeComments = analyzeComments as jest.MockedFunction<typeof analyzeComments>
		mockAnalyzeComments.mockReturnValue({ score: 1, factor: 'Comments factor' })

		const mockCountAssigneeChanges = countAssigneeChanges as jest.MockedFunction<typeof countAssigneeChanges>
		mockCountAssigneeChanges.mockReturnValue({ score: 1, factor: 'Assignee changes factor' })

		const mockAnalyzeEstimationChanges = analyzeEstimationChanges as jest.MockedFunction<
			typeof analyzeEstimationChanges
		>
		mockAnalyzeEstimationChanges.mockReturnValue({ score: 1, factor: 'Estimation changes factor' })

		const mockAnalyzeFieldModifications = analyzeFieldModifications as jest.MockedFunction<
			typeof analyzeFieldModifications
		>
		mockAnalyzeFieldModifications.mockReturnValue({ score: 1, factor: 'Field modifications factor' })

		const mockAnalyzeComponentTouchpoints = analyzeComponentTouchpoints as jest.MockedFunction<
			typeof analyzeComponentTouchpoints
		>
		mockAnalyzeComponentTouchpoints.mockReturnValue({ score: 1, factor: 'Component touchpoints factor' })

		const mockDetermineComplexityLevel = determineComplexityLevel as jest.MockedFunction<
			typeof determineComplexityLevel
		>
		mockDetermineComplexityLevel.mockReturnValue('moderate')
	})

	it('should call all analyzer functions with correct parameters', () => {
		getComplexityAnalysis(mockIssue, mockCommentsResponse)

		expect(analyzeTechnicalComplexity).toHaveBeenCalledWith(mockIssue, mockCommentsResponse)
		expect(analyzeLinkedIssues).toHaveBeenCalledWith(mockIssue)
		expect(analyzeComments).toHaveBeenCalledWith(mockCommentsResponse)
		expect(countAssigneeChanges).toHaveBeenCalledWith(mockIssue)
		expect(analyzeEstimationChanges).toHaveBeenCalledWith(mockIssue)
		expect(analyzeFieldModifications).toHaveBeenCalledWith(mockIssue)
		expect(analyzeComponentTouchpoints).toHaveBeenCalledWith(mockIssue)
	})

	it('should calculate complexity score by summing all component scores', () => {
		const result = getComplexityAnalysis(mockIssue, mockCommentsResponse)

		// 7 factors with score 1 each = 7 total
		expect(result.score).toBe(7)
		expect(determineComplexityLevel).toHaveBeenCalledWith(7)
		expect(result.level).toBe('moderate')
	})

	it('should include all non-null factors in the factors array', () => {
		// Mock one analyzer to return null factor
		const mockAnalyzeComponentTouchpoints = analyzeComponentTouchpoints as jest.MockedFunction<
			typeof analyzeComponentTouchpoints
		>
		mockAnalyzeComponentTouchpoints.mockReturnValue({ score: 1, factor: null })

		const result = getComplexityAnalysis(mockIssue, mockCommentsResponse)

		expect(result.factors).toHaveLength(6) // One less than the total analyzers
		expect(result.factors).toContain('Technical factor')
		expect(result.factors).toContain('Linked issues factor')
		expect(result.factors).toContain('Comments factor')
		expect(result.factors).toContain('Assignee changes factor')
		expect(result.factors).toContain('Estimation changes factor')
		expect(result.factors).toContain('Field modifications factor')
		expect(result.factors).not.toContain(null)
	})

	it('should normalize score to be between 1 and 10', () => {
		// Mock analyzers to return high scores
		const mockAnalyzers = [
			analyzeTechnicalComplexity,
			analyzeLinkedIssues,
			analyzeComments,
			countAssigneeChanges,
			analyzeEstimationChanges,
			analyzeFieldModifications,
			analyzeComponentTouchpoints,
		] as jest.MockedFunction<any>[]

		mockAnalyzers.forEach(function (analyzer) {
			analyzer.mockReturnValue({ score: 5, factor: 'High score factor' })
		})

		const result = getComplexityAnalysis(mockIssue, mockCommentsResponse)

		// 7 analyzers with score 5 each = 35, should be capped at 10
		expect(result.score).toBe(10)
	})

	it('should handle the case when all analyzers return score 0', () => {
		const mockAnalyzers = [
			analyzeTechnicalComplexity,
			analyzeLinkedIssues,
			analyzeComments,
			countAssigneeChanges,
			analyzeEstimationChanges,
			analyzeFieldModifications,
			analyzeComponentTouchpoints,
		] as jest.MockedFunction<any>[]

		mockAnalyzers.forEach(function (analyzer) {
			analyzer.mockReturnValue({ score: 0, factor: null })
		})

		const result = getComplexityAnalysis(mockIssue, mockCommentsResponse)

		// Minimum score should be 1
		expect(result.score).toBe(1)
		expect(result.factors).toHaveLength(0)
	})
})
