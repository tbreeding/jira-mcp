import { analyzeIssue } from '../analyzeIssue'
import { getCompletenessEvaluation } from '../completenessEvaluation/getCompletenessEvaluation'
import { getComplexityAnalysis } from '../complexityAnalysis/getComplexityAnalysis'
import { getContinuityAnalysis } from '../continuityAnalysis/getContinuityAnalysis'
import { getDependenciesAnalysis } from '../dependenciesAnalysis/getDependenciesAnalysis'
import { getDurationAssessment } from '../durationAssessment/getDurationAssessment'
import { getMetadataAssessment } from '../metadataAssessment/getMetadataAssessment'
import { getRiskIdentification } from '../riskIdentification/getRiskIdentification'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'
import type { CompletenessEvaluation } from '../completenessEvaluation/completenessEvaluation.types'
import type { Dependencies } from '../dependenciesAnalysis/types/dependencies.types'

// Mock dependencies
jest.mock('../completenessEvaluation/getCompletenessEvaluation')
jest.mock('../complexityAnalysis/getComplexityAnalysis')
jest.mock('../dependenciesAnalysis/getDependenciesAnalysis')
jest.mock('../metadataAssessment/getMetadataAssessment')
jest.mock('../durationAssessment/getDurationAssessment')
jest.mock('../continuityAnalysis/getContinuityAnalysis')
jest.mock('../riskIdentification/getRiskIdentification')

describe('analyzeIssue', () => {
	// Setup mock implementations
	beforeEach(() => {
		jest.resetAllMocks()

		// Set up mock return values
		jest.mocked(getMetadataAssessment).mockReturnValue({
			issueType: 'Bug',
			summary: 'Good summary',
			priorityAppropriate: true,
			labelsAndComponentsAppropriate: true,
			assignmentChanges: 1,
		})

		jest.mocked(getComplexityAnalysis).mockReturnValue({
			score: 3,
			factors: ['Few linked issues'],
			level: 'simple',
		})

		jest.mocked(getCompletenessEvaluation).mockReturnValue({
			score: 85,
			missingInformation: ['Technical constraints could be more detailed'],
			suggestions: ['Add more details about technical constraints'],
		} as CompletenessEvaluation)

		jest.mocked(getDependenciesAnalysis).mockReturnValue({
			blockers: [],
			relatedIssues: [],
			implicitDependencies: [],
			externalDependencies: [],
		} as Dependencies)

		jest.mocked(getDurationAssessment).mockReturnValue({
			inProgressDays: null,
			exceedsSprint: false,
			sprintReassignments: 0,
			pointToDurationRatio: null,
			statusTransitions: {
				firstInProgress: null,
				lastDone: null,
				averageTimeInStatus: {},
			},
			statusCycling: {
				count: {},
				totalRevisits: 0,
			},
			blockedTime: {
				totalDays: 0,
				reasons: [],
			},
			anomalies: [],
		})

		jest.mocked(getContinuityAnalysis).mockReturnValue({
			flowEfficiency: NaN,
			stagnationPeriods: [],
			longestStagnationPeriod: 0,
			communicationGaps: [],
			contextSwitches: {
				count: 0,
				timing: [],
				impact: 'None - no assignee changes',
			},
			momentumScore: 6,
			workFragmentation: {
				fragmentationScore: 1,
				activeWorkPeriods: 0,
			},
			lateStageChanges: [],
			feedbackResponseTime: 0,
		})

		jest.mocked(getRiskIdentification).mockReturnValue({
			score: 2,
			items: [
				'Issue not assigned to anyone, possibly due to knowledge requirements',
				'Missing information: Technical constraints could be more detailed',
				'Issue has no description',
			],
			mitigationSuggestions: [
				'Add more details about technical constraints',
				'Request complete description and requirements before proceeding',
				'Schedule knowledge sharing sessions; document specialized components',
				'Request clarification on missing requirements before implementation begins',
			],
		})
	})

	it('should return an analysis result with the correct structure', () => {
		// Arrange
		const mockIssue = {
			key: 'TEST-123',
			fields: {
				summary: 'Test summary',
				issuetype: {
					name: 'Bug',
				},
			},
		} as JiraIssue

		const mockComments: IssueCommentResponse = {
			comments: [],
			startAt: 0,
			maxResults: 0,
			total: 0,
		}

		// Act
		const result = analyzeIssue(mockIssue, mockComments)

		// Assert
		expect(result).toEqual({
			issueKey: 'TEST-123',
			summary: 'Test summary',
			issueType: 'Bug',
			metadata: {
				issueType: 'Bug',
				summary: 'Good summary',
				priorityAppropriate: true,
				labelsAndComponentsAppropriate: true,
				assignmentChanges: 1,
			},
			complexity: {
				score: 3,
				factors: ['Few linked issues'],
				level: 'simple',
			},
			completeness: {
				score: 85,
				missingInformation: ['Technical constraints could be more detailed'],
				suggestions: ['Add more details about technical constraints'],
			},
			dependencies: {
				blockers: [],
				relatedIssues: [],
				implicitDependencies: [],
				externalDependencies: [],
			},
			duration: {
				inProgressDays: null,
				exceedsSprint: false,
				sprintReassignments: 0,
				pointToDurationRatio: null,
				statusTransitions: {
					firstInProgress: null,
					lastDone: null,
					averageTimeInStatus: {},
				},
				statusCycling: {
					count: {},
					totalRevisits: 0,
				},
				blockedTime: {
					totalDays: 0,
					reasons: [],
				},
				anomalies: [],
			},
			continuity: {
				flowEfficiency: NaN,
				stagnationPeriods: [],
				longestStagnationPeriod: 0,
				communicationGaps: [],
				contextSwitches: {
					count: 0,
					timing: [],
					impact: 'None - no assignee changes',
				},
				momentumScore: 6,
				workFragmentation: {
					fragmentationScore: 1,
					activeWorkPeriods: 0,
				},
				lateStageChanges: [],
				feedbackResponseTime: 0,
			},
			risks: {
				score: 2,
				items: [
					'Issue not assigned to anyone, possibly due to knowledge requirements',
					'Missing information: Technical constraints could be more detailed',
					'Issue has no description',
				],
				mitigationSuggestions: [
					'Add more details about technical constraints',
					'Request complete description and requirements before proceeding',
					'Schedule knowledge sharing sessions; document specialized components',
					'Request clarification on missing requirements before implementation begins',
				],
			},
		})

		// Verify that all analysis functions were called with the correct parameters
		expect(getMetadataAssessment).toHaveBeenCalledWith(mockIssue, mockComments)
		expect(getComplexityAnalysis).toHaveBeenCalledWith(mockIssue, mockComments)
		expect(getCompletenessEvaluation).toHaveBeenCalledWith(mockIssue, mockComments)
		expect(getDependenciesAnalysis).toHaveBeenCalledWith(mockIssue, mockComments)
		expect(getDurationAssessment).toHaveBeenCalledWith(mockIssue, mockComments)
		expect(getContinuityAnalysis).toHaveBeenCalledWith(mockIssue, mockComments)
		expect(getRiskIdentification).toHaveBeenCalledWith(mockIssue, mockComments, expect.any(Object))
	})

	it('should handle null inputs gracefully', () => {
		// Arrange
		const mockIssue = null as unknown as JiraIssue
		const mockComments = null as unknown as IssueCommentResponse

		// Act & Assert
		expect(() => analyzeIssue(mockIssue, mockComments)).toThrow()
	})
})
