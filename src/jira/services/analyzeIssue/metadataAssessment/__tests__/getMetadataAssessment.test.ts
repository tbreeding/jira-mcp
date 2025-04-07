import { getMetadataAssessment } from '../getMetadataAssessment'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'

// Mock dependencies before importing
jest.mock('../evaluateIssueType', () => ({
	evaluateIssueType: jest.fn(),
}))

jest.mock('../evaluateSummaryQuality', () => ({
	evaluateSummaryQuality: jest.fn(),
}))

jest.mock('../evaluatePriorityAlignment', () => ({
	evaluatePriorityAlignment: jest.fn(),
}))

jest.mock('../evaluateLabelsAndComponents', () => ({
	evaluateLabelsAndComponents: jest.fn(),
}))

jest.mock('../countAssignmentChanges', () => ({
	countAssignmentChanges: jest.fn(),
}))

// Import the mocked modules
import { evaluateIssueType } from '../evaluateIssueType'
import { evaluateSummaryQuality } from '../evaluateSummaryQuality'
import { evaluatePriorityAlignment } from '../evaluatePriorityAlignment'
import { evaluateLabelsAndComponents } from '../evaluateLabelsAndComponents'
import { countAssignmentChanges } from '../countAssignmentChanges'

// Get the mock functions
const mockEvaluateIssueType = evaluateIssueType as jest.Mock
const mockEvaluateSummaryQuality = evaluateSummaryQuality as jest.Mock
const mockEvaluatePriorityAlignment = evaluatePriorityAlignment as jest.Mock
const mockEvaluateLabelsAndComponents = evaluateLabelsAndComponents as jest.Mock
const mockCountAssignmentChanges = countAssignmentChanges as jest.Mock

describe('getMetadataAssessment', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should aggregate results from all evaluation functions', () => {
		// Set up mock return values
		mockEvaluateIssueType.mockReturnValue('Bug')
		mockEvaluateSummaryQuality.mockReturnValue('Good: Clear, specific, and actionable')
		mockEvaluatePriorityAlignment.mockReturnValue(true)
		mockEvaluateLabelsAndComponents.mockReturnValue(true)
		mockCountAssignmentChanges.mockReturnValue(2)

		// Mock issue and comments
		const mockIssue = {} as JiraIssue
		const mockComments = {} as IssueCommentResponse

		// Call the function
		const result = getMetadataAssessment(mockIssue, mockComments)

		// Verify all evaluation functions were called with correct parameters
		expect(mockEvaluateIssueType).toHaveBeenCalledWith(mockIssue, mockComments)
		expect(mockEvaluateSummaryQuality).toHaveBeenCalledWith(mockIssue)
		expect(mockEvaluatePriorityAlignment).toHaveBeenCalledWith(mockIssue, mockComments)
		expect(mockEvaluateLabelsAndComponents).toHaveBeenCalledWith(mockIssue)
		expect(mockCountAssignmentChanges).toHaveBeenCalledWith(mockIssue)

		// Verify correct result structure and values
		expect(result).toEqual({
			issueType: 'Bug',
			summary: 'Good: Clear, specific, and actionable',
			priorityAppropriate: true,
			labelsAndComponentsAppropriate: true,
			assignmentChanges: 2,
		})
	})

	it('should handle different evaluation results', () => {
		// Set up different mock return values
		mockEvaluateIssueType.mockReturnValue('Story')
		mockEvaluateSummaryQuality.mockReturnValue('Too vague: Be more specific about what needs to be done')
		mockEvaluatePriorityAlignment.mockReturnValue(false)
		mockEvaluateLabelsAndComponents.mockReturnValue(false)
		mockCountAssignmentChanges.mockReturnValue(0)

		// Mock issue and comments
		const mockIssue = {} as JiraIssue
		const mockComments = {} as IssueCommentResponse

		// Call the function
		const result = getMetadataAssessment(mockIssue, mockComments)

		// Verify correct result structure and values
		expect(result).toEqual({
			issueType: 'Story',
			summary: 'Too vague: Be more specific about what needs to be done',
			priorityAppropriate: false,
			labelsAndComponentsAppropriate: false,
			assignmentChanges: 0,
		})
	})
})
