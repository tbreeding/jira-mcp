/**
 * Tests for Timeline Risk Analysis
 *
 * This file contains tests for the analyzeTimelineRisk function, which
 * identifies timeline-related risks in Jira issues.
 */

import { analyzeTimelineRisk } from '../analyzeTimelineRisk'
import { processDurationData } from '../helpers/processDurationData'
import {
	processTimelineConstraintIndicators,
	processEstimationConcernIndicators,
} from '../helpers/timelineTextAnalysisHelpers'
import { detectRiskIndicators } from '../utils/detectRiskIndicators'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'
import type { PreviousAnalysisResults } from '../types/riskIdentification.types'

// Mock dependencies
jest.mock('../utils/detectRiskIndicators')
jest.mock('../helpers/timelineTextAnalysisHelpers')
jest.mock('../helpers/processDurationData')

describe('analyzeTimelineRisk', () => {
	beforeEach(() => {
		jest.clearAllMocks()

		// Default mock implementations
		;(detectRiskIndicators as jest.Mock).mockReturnValue({
			present: false,
			indicators: [],
			severity: 'low',
		})
		;(processTimelineConstraintIndicators as jest.Mock).mockReturnValue(0)
		;(processEstimationConcernIndicators as jest.Mock).mockReturnValue(0)
		;(processDurationData as jest.Mock).mockReturnValue(0)
	})

	// Test data
	const mockIssue = {
		key: 'TIME-123',
		fields: {
			summary: 'Task with timeline risks',
			description: 'This is a description about timeline',
		},
	} as unknown as JiraIssue

	const mockComments: IssueCommentResponse = {
		comments: [
			{
				id: '1',
				body: 'Comment about deadlines',
			} as any,
		],
		total: 1,
		startAt: 0,
		maxResults: 1,
	}

	const mockPreviousResults = {
		duration: {
			durationAnomalies: ['Anomaly 1', 'Anomaly 2'],
			blockedPeriods: [{ days: 3, reason: 'Testing delay' }],
		},
	} as unknown as PreviousAnalysisResults

	test('calls detectRiskIndicators with correct parameters for each risk type', () => {
		// Call the function
		analyzeTimelineRisk(mockIssue, mockComments)

		// Verify detectRiskIndicators was called twice with correct parameters
		expect(detectRiskIndicators).toHaveBeenCalledTimes(2)

		// All calls should include the combined text
		const expectedText = 'This is a description about timeline Comment about deadlines'
		expect(detectRiskIndicators).toHaveBeenNthCalledWith(1, expectedText, expect.any(Array), 'Timeline Risk')
		expect(detectRiskIndicators).toHaveBeenNthCalledWith(2, expectedText, expect.any(Array), 'Estimation Risk')
	})

	test('calls processing functions with detection results', () => {
		// Setup mock for detectRiskIndicators to return different values for each call
		const timelineResult = {
			present: true,
			indicators: ['Timeline risk indicator'],
			severity: 'high',
		}

		const estimationResult = {
			present: true,
			indicators: ['Estimation risk indicator'],
			severity: 'medium',
		}

		;(detectRiskIndicators as jest.Mock).mockReturnValueOnce(timelineResult).mockReturnValueOnce(estimationResult)

		// Call the function
		analyzeTimelineRisk(mockIssue, mockComments)

		// Verify all processing functions are called with correct parameters
		expect(processTimelineConstraintIndicators).toHaveBeenCalledWith(
			timelineResult,
			expect.any(Array),
			expect.any(Array),
		)

		expect(processEstimationConcernIndicators).toHaveBeenCalledWith(
			estimationResult,
			expect.any(Array),
			expect.any(Array),
		)
	})

	test('processes previous duration data when available', () => {
		// Call with previous results
		analyzeTimelineRisk(mockIssue, mockComments, mockPreviousResults)

		// Verify processDurationData is called with correct parameters
		expect(processDurationData).toHaveBeenCalledWith(mockPreviousResults.duration, expect.any(Array), expect.any(Array))
	})

	test('does not process duration data when no previous results', () => {
		// Call without previous results
		analyzeTimelineRisk(mockIssue, mockComments)

		// Verify processDurationData is not called
		expect(processDurationData).not.toHaveBeenCalled()
	})

	test('calculates combined risk score correctly', () => {
		// Setup mocks to return specific score increases
		;(processTimelineConstraintIndicators as jest.Mock).mockReturnValue(2)
		;(processEstimationConcernIndicators as jest.Mock).mockReturnValue(1)
		;(processDurationData as jest.Mock).mockReturnValue(3)

		// Call the function with previous results
		const result = analyzeTimelineRisk(mockIssue, mockComments, mockPreviousResults)

		// Base score (1) + timeline constraints (2) + estimation concerns (1) + duration data (3) = 7
		expect(result.score).toBe(7)
	})

	test('ensures score is capped at maximum of 10', () => {
		// Setup mocks to return large score increases
		;(processTimelineConstraintIndicators as jest.Mock).mockReturnValue(4)
		;(processEstimationConcernIndicators as jest.Mock).mockReturnValue(3)
		;(processDurationData as jest.Mock).mockReturnValue(5)

		// Call the function with previous results
		const result = analyzeTimelineRisk(mockIssue, mockComments, mockPreviousResults)

		// Score would be 13 but should be capped at 10
		expect(result.score).toBe(10)
	})

	test('ensures minimum score is 1', () => {
		// Setup mocks to return negative score increases
		;(processTimelineConstraintIndicators as jest.Mock).mockReturnValue(-2)
		;(processEstimationConcernIndicators as jest.Mock).mockReturnValue(-3)
		;(processDurationData as jest.Mock).mockReturnValue(-1)

		// Call the function
		const result = analyzeTimelineRisk(mockIssue, mockComments, mockPreviousResults)

		// Score would be -5 but should be minimum 1
		expect(result.score).toBe(1)
	})

	test('combines risk items and mitigation suggestions', () => {
		// Setup mocks to modify riskItems and mitigationSuggestions arrays
		;(processTimelineConstraintIndicators as jest.Mock).mockImplementation(
			(result, riskItems, mitigationSuggestions) => {
				riskItems.push('Timeline risk 1')
				mitigationSuggestions.push('Timeline mitigation 1')
				return 1
			},
		)
		;(processEstimationConcernIndicators as jest.Mock).mockImplementation(
			(result, riskItems, mitigationSuggestions) => {
				riskItems.push('Estimation risk 1')
				mitigationSuggestions.push('Estimation mitigation 1')
				mitigationSuggestions.push('Timeline mitigation 1') // Duplicate
				return 1
			},
		)
		;(processDurationData as jest.Mock).mockImplementation((durationData, riskItems, mitigationSuggestions) => {
			riskItems.push('Duration risk 1')
			mitigationSuggestions.push('Duration mitigation 1')
			return 1
		})

		// Call the function with previous results
		const result = analyzeTimelineRisk(mockIssue, mockComments, mockPreviousResults)

		// Verify risk items are combined correctly
		expect(result.riskItems).toContain('Timeline risk 1')
		expect(result.riskItems).toContain('Estimation risk 1')
		expect(result.riskItems).toContain('Duration risk 1')
		expect(result.riskItems.length).toBe(3)

		// Verify mitigation suggestions are combined and deduplicated
		expect(result.mitigationSuggestions).toContain('Timeline mitigation 1')
		expect(result.mitigationSuggestions).toContain('Estimation mitigation 1')
		expect(result.mitigationSuggestions).toContain('Duration mitigation 1')
		// Duplicates should be removed
		expect(result.mitigationSuggestions.length).toBe(3)
	})

	test('handles object description correctly', () => {
		// Create an issue with an object description (ADF format)
		const mockIssueWithObjectDescription = {
			key: 'TIME-124',
			fields: {
				summary: 'Task with object description',
				description: {
					type: 'doc',
					content: [{ type: 'paragraph', content: [{ type: 'text', text: 'ADF content' }] }],
				},
			},
		} as unknown as JiraIssue

		// Call the function
		analyzeTimelineRisk(mockIssueWithObjectDescription, mockComments)

		// Verify detectRiskIndicators was called with object description
		expect(detectRiskIndicators).toHaveBeenCalledWith(
			expect.stringContaining('Comment about deadlines'),
			expect.any(Array),
			'Timeline Risk',
		)
	})

	test('handles null description', () => {
		// Create issue with null description
		const mockNullDescriptionIssue = {
			key: 'TIME-125',
			fields: {
				summary: 'Task with null description',
				description: null,
			},
		} as unknown as JiraIssue

		// Call the function
		analyzeTimelineRisk(mockNullDescriptionIssue, mockComments)

		// Verify detectRiskIndicators was called with empty string for the description
		expect(detectRiskIndicators).toHaveBeenCalledTimes(2)
		expect(detectRiskIndicators).toHaveBeenNthCalledWith(
			1,
			' Comment about deadlines',
			expect.any(Array),
			'Timeline Risk',
		)
	})

	test('handles description field when it is a complex object instead of string', () => {
		// Create a mock issue with an object as description
		const complexDescriptionIssue = {
			key: 'TIME-125',
			fields: {
				summary: 'Task with object description',
				description: { content: [{ type: 'text', text: 'Description content' }] },
			},
		} as unknown as JiraIssue

		// Call the function with the complex description issue
		const result = analyzeTimelineRisk(complexDescriptionIssue, mockComments)

		// Verify detect functions are called
		expect(detectRiskIndicators).toHaveBeenCalledTimes(2)
		expect(detectRiskIndicators).toHaveBeenNthCalledWith(
			1,
			'[object Object] Comment about deadlines', // The object is converted to string
			expect.any(Array),
			'Timeline Risk',
		)

		// Result should still be valid
		expect(result).toHaveProperty('score')
		expect(result).toHaveProperty('riskItems')
		expect(result).toHaveProperty('mitigationSuggestions')
	})

	test('handles undefined description properly', () => {
		// Create issue with undefined description
		const mockUndefinedDescriptionIssue = {
			key: 'TIME-126',
			fields: {
				summary: 'Task with undefined description',
				description: undefined,
			},
		} as unknown as JiraIssue

		// Call the function
		const result = analyzeTimelineRisk(mockUndefinedDescriptionIssue, mockComments)

		// Verify detectRiskIndicators was called with empty string for the description
		expect(detectRiskIndicators).toHaveBeenCalledTimes(2)
		expect(detectRiskIndicators).toHaveBeenNthCalledWith(
			1,
			' Comment about deadlines',
			expect.any(Array),
			'Timeline Risk',
		)

		// Result should still be valid
		expect(result).toHaveProperty('score')
		expect(result).toHaveProperty('riskItems')
		expect(result).toHaveProperty('mitigationSuggestions')
	})

	test('handles comments with null body', () => {
		// Create comments with null body
		const mockCommentsWithNullBody: IssueCommentResponse = {
			comments: [
				{
					id: '1',
					body: null,
				} as any,
			],
			total: 1,
			startAt: 0,
			maxResults: 1,
		}

		// Call the function
		const result = analyzeTimelineRisk(mockIssue, mockCommentsWithNullBody)

		// Verify detectRiskIndicators was called with empty string for the comment
		expect(detectRiskIndicators).toHaveBeenCalledTimes(2)
		expect(detectRiskIndicators).toHaveBeenNthCalledWith(
			1,
			'This is a description about timeline ',
			expect.any(Array),
			'Timeline Risk',
		)

		// Result should still be valid
		expect(result).toHaveProperty('score')
		expect(result).toHaveProperty('riskItems')
		expect(result).toHaveProperty('mitigationSuggestions')
	})

	test('handles comments with undefined body', () => {
		// Create comments with undefined body
		const mockCommentsWithUndefinedBody: IssueCommentResponse = {
			comments: [
				{
					id: '1',
					body: undefined,
				} as any,
			],
			total: 1,
			startAt: 0,
			maxResults: 1,
		}

		// Call the function
		const result = analyzeTimelineRisk(mockIssue, mockCommentsWithUndefinedBody)

		// Verify detectRiskIndicators was called with empty string for the comment
		expect(detectRiskIndicators).toHaveBeenCalledTimes(2)
		expect(detectRiskIndicators).toHaveBeenNthCalledWith(
			1,
			'This is a description about timeline ',
			expect.any(Array),
			'Timeline Risk',
		)

		// Result should still be valid
		expect(result).toHaveProperty('score')
		expect(result).toHaveProperty('riskItems')
		expect(result).toHaveProperty('mitigationSuggestions')
	})
})
