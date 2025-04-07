/**
 * Tests for Knowledge Risk Analysis
 *
 * This file contains tests for the analyzeKnowledgeRisk function, which
 * identifies knowledge-related risks in Jira issues.
 */

import { analyzeKnowledgeRisk } from '../analyzeKnowledgeRisk'
import { detectAssigneeConcentrationRisk } from '../helpers/assigneeRiskHelpers'
import { processComplexityAnalysis } from '../helpers/complexityRiskHelpers'
import {
	processKnowledgeConcentrationIndicators,
	processSpecializedTechnologyIndicators,
} from '../helpers/knowledgeTextAnalysisHelpers'
import { detectRiskIndicators } from '../utils/detectRiskIndicators'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'
import type { PreviousAnalysisResults } from '../types/riskIdentification.types'

// Mock dependencies
jest.mock('../utils/detectRiskIndicators')
jest.mock('../helpers/assigneeRiskHelpers')
jest.mock('../helpers/complexityRiskHelpers')
jest.mock('../helpers/knowledgeTextAnalysisHelpers')

describe('analyzeKnowledgeRisk', () => {
	beforeEach(() => {
		jest.clearAllMocks()

		// Default mock implementations
		;(detectRiskIndicators as jest.Mock).mockReturnValue({
			present: false,
			indicators: [],
			severity: 'low',
		})
		;(detectAssigneeConcentrationRisk as jest.Mock).mockReturnValue(null)
		;(processComplexityAnalysis as jest.Mock).mockReturnValue(0)
		;(processKnowledgeConcentrationIndicators as jest.Mock).mockReturnValue(0)
		;(processSpecializedTechnologyIndicators as jest.Mock).mockReturnValue(0)
	})

	// Test data
	const mockIssue = {
		key: 'KNOW-123',
		fields: {
			summary: 'Task with knowledge risks',
			description: 'This is a description about knowledge',
			assignee: {
				displayName: 'Test User',
				accountId: 'user123',
			},
		},
	} as unknown as JiraIssue

	const mockComments: IssueCommentResponse = {
		comments: [
			{
				id: '1',
				body: 'Comment about knowledge',
			} as any,
		],
		total: 1,
		startAt: 0,
		maxResults: 1,
	}

	const mockPreviousResults = {
		complexity: {
			level: 'high',
			score: 8,
		},
	} as unknown as PreviousAnalysisResults

	test('calls detectRiskIndicators with correct parameters for each knowledge risk type', () => {
		// Call the function
		analyzeKnowledgeRisk(mockIssue, mockComments)

		// Verify detectRiskIndicators was called twice with correct parameters
		expect(detectRiskIndicators).toHaveBeenCalledTimes(2)

		// All calls should include the combined text
		const expectedText = 'This is a description about knowledge Comment about knowledge'
		expect(detectRiskIndicators).toHaveBeenNthCalledWith(1, expectedText, expect.any(Array), 'Knowledge Risk')
		expect(detectRiskIndicators).toHaveBeenNthCalledWith(
			2,
			expectedText,
			expect.any(Array),
			'Specialized Technology Risk',
		)
	})

	test('calls processing functions with appropriate detection results', () => {
		// Setup mock for detectRiskIndicators to return different values for each call
		const knowledgeResult = {
			present: true,
			indicators: ['Knowledge risk indicator'],
			severity: 'high',
		}

		const techResult = {
			present: true,
			indicators: ['Specialized technology indicator'],
			severity: 'medium',
		}

		;(detectRiskIndicators as jest.Mock).mockReturnValueOnce(knowledgeResult).mockReturnValueOnce(techResult)

		// Call the function
		analyzeKnowledgeRisk(mockIssue, mockComments)

		// Verify all processing functions are called with correct parameters
		expect(processKnowledgeConcentrationIndicators).toHaveBeenCalledWith(
			knowledgeResult,
			expect.any(Array),
			expect.any(Array),
		)

		expect(processSpecializedTechnologyIndicators).toHaveBeenCalledWith(
			techResult,
			expect.any(Array),
			expect.any(Array),
		)
	})

	test('checks for assignee concentration risk', () => {
		// Call the function
		analyzeKnowledgeRisk(mockIssue, mockComments)

		// Verify detectAssigneeConcentrationRisk is called with the issue
		expect(detectAssigneeConcentrationRisk).toHaveBeenCalledWith(mockIssue)
	})

	test('adds assignee risk item when detected', () => {
		// Setup mock to return a risk
		;(detectAssigneeConcentrationRisk as jest.Mock).mockReturnValue('Assignee risk detected')

		// Call the function
		const result = analyzeKnowledgeRisk(mockIssue, mockComments)

		// Verify risk item is added and score is increased
		expect(result.riskItems).toContain('Assignee risk detected')
		expect(result.score).toBeGreaterThan(1) // Base score + 2 for assignee risk
	})

	test('processes previous complexity data when available', () => {
		// Call the function with previous results
		analyzeKnowledgeRisk(mockIssue, mockComments, mockPreviousResults)

		// Verify processComplexityAnalysis is called with complexity level
		expect(processComplexityAnalysis).toHaveBeenCalledWith('high', expect.any(Array), expect.any(Array))
	})

	test('does not process complexity when no previous results', () => {
		// Call without previous results
		analyzeKnowledgeRisk(mockIssue, mockComments)

		// Verify processComplexityAnalysis is not called
		expect(processComplexityAnalysis).not.toHaveBeenCalled()
	})

	test('calculates combined risk score correctly', () => {
		// Setup mocks to return specific score increases
		;(processKnowledgeConcentrationIndicators as jest.Mock).mockReturnValue(2)
		;(processSpecializedTechnologyIndicators as jest.Mock).mockReturnValue(1)
		;(detectAssigneeConcentrationRisk as jest.Mock).mockReturnValue('Assignee risk') // +2 score
		;(processComplexityAnalysis as jest.Mock).mockReturnValue(1)

		// Call the function with previous results
		const result = analyzeKnowledgeRisk(mockIssue, mockComments, mockPreviousResults)

		// Base score (1) + knowledge concentration (2) + specialized tech (1) + assignee (2) + complexity (1) = 7
		expect(result.score).toBe(7)
	})

	test('ensures score is capped at maximum of 10', () => {
		// Setup mocks to return large score increases
		;(processKnowledgeConcentrationIndicators as jest.Mock).mockReturnValue(4)
		;(processSpecializedTechnologyIndicators as jest.Mock).mockReturnValue(3)
		;(detectAssigneeConcentrationRisk as jest.Mock).mockReturnValue('Single assignee handling multiple complex issues')
		;(processComplexityAnalysis as jest.Mock).mockReturnValue(5)

		// Call the function
		const result = analyzeKnowledgeRisk(mockIssue, mockComments, mockPreviousResults)

		// Score would be 15 (1 + 4 + 3 + 2 + 5) but should be capped at 10
		expect(result.score).toBe(10)
	})

	test('ensures score is at minimum of 1', () => {
		// Setup mocks to return negative score increases
		;(processKnowledgeConcentrationIndicators as jest.Mock).mockReturnValue(-2)
		;(processSpecializedTechnologyIndicators as jest.Mock).mockReturnValue(-3)
		;(detectAssigneeConcentrationRisk as jest.Mock).mockReturnValue(null)

		// Call the function
		const result = analyzeKnowledgeRisk(mockIssue, mockComments)

		// Score would be -4 but should be minimum 1
		expect(result.score).toBe(1)
	})

	test('handles object description correctly', () => {
		// Create an issue with an object description (ADF format)
		const mockIssueWithObjectDescription = {
			key: 'KNOW-125',
			fields: {
				summary: 'Task with object description',
				description: {
					type: 'doc',
					content: [{ type: 'paragraph', content: [{ type: 'text', text: 'ADF content' }] }],
				},
				assignee: {
					displayName: 'Test User',
					accountId: 'user123',
				},
			},
		} as unknown as JiraIssue

		// Call the function
		analyzeKnowledgeRisk(mockIssueWithObjectDescription, mockComments)

		// Verify detectRiskIndicators was called with object description
		expect(detectRiskIndicators).toHaveBeenCalledWith(
			expect.stringContaining('Comment about knowledge'),
			expect.any(Array),
			'Knowledge Risk',
		)
	})

	test('handles null description', () => {
		// Create issue with null description
		const mockNullDescriptionIssue = {
			key: 'KNOW-125',
			fields: {
				summary: 'Task with null description',
				description: null,
				assignee: {
					displayName: 'Test User',
					accountId: 'user123',
				},
			},
		} as unknown as JiraIssue

		// Call the function
		analyzeKnowledgeRisk(mockNullDescriptionIssue, mockComments)

		// Verify detectRiskIndicators was called with empty string for the description
		expect(detectRiskIndicators).toHaveBeenCalledTimes(2)
		expect(detectRiskIndicators).toHaveBeenNthCalledWith(
			1,
			' Comment about knowledge',
			expect.any(Array),
			'Knowledge Risk',
		)
	})

	test('handles description field when it is a complex object instead of string', () => {
		// Create a mock issue with an object as description
		const complexDescriptionIssue = {
			key: 'KNOW-125',
			fields: {
				summary: 'Task with object description',
				description: { content: [{ type: 'text', text: 'Description content' }] },
			},
		} as unknown as JiraIssue

		// Call the function with the complex description issue
		const result = analyzeKnowledgeRisk(complexDescriptionIssue, mockComments)

		// Verify detect functions are called
		expect(detectRiskIndicators).toHaveBeenCalledTimes(2)
		expect(detectRiskIndicators).toHaveBeenNthCalledWith(
			1,
			'[object Object] Comment about knowledge', // The object is converted to string
			expect.any(Array),
			'Knowledge Risk',
		)

		// Result should still be valid
		expect(result).toHaveProperty('score')
		expect(result).toHaveProperty('riskItems')
		expect(result).toHaveProperty('mitigationSuggestions')
	})

	test('combines risk items and mitigation suggestions', () => {
		// Setup mocks to modify riskItems and mitigationSuggestions arrays
		;(processKnowledgeConcentrationIndicators as jest.Mock).mockImplementation(
			(result, riskItems, mitigationSuggestions) => {
				riskItems.push('Knowledge concentration risk 1')
				mitigationSuggestions.push('Knowledge concentration mitigation 1')
				return 1
			},
		)
		;(processSpecializedTechnologyIndicators as jest.Mock).mockImplementation(
			(result, riskItems, mitigationSuggestions) => {
				riskItems.push('Specialized tech risk 1')
				mitigationSuggestions.push('Specialized tech mitigation 1')
				mitigationSuggestions.push('Knowledge concentration mitigation 1') // Duplicate
				return 1
			},
		)
		;(detectAssigneeConcentrationRisk as jest.Mock).mockReturnValue('Assignee concentration risk')
		;(processComplexityAnalysis as jest.Mock).mockImplementation((level, riskItems, mitigationSuggestions) => {
			riskItems.push('Complexity risk 1')
			mitigationSuggestions.push('Complexity mitigation 1')
			return 1
		})

		// Call the function with previous results
		const result = analyzeKnowledgeRisk(mockIssue, mockComments, mockPreviousResults)

		// Verify risk items are combined correctly
		expect(result.riskItems).toContain('Knowledge concentration risk 1')
		expect(result.riskItems).toContain('Specialized tech risk 1')
		expect(result.riskItems).toContain('Assignee concentration risk')
		expect(result.riskItems).toContain('Complexity risk 1')
		expect(result.riskItems.length).toBe(4)

		// Verify mitigation suggestions are combined and deduplicated
		expect(result.mitigationSuggestions).toContain('Knowledge concentration mitigation 1')
		expect(result.mitigationSuggestions).toContain('Specialized tech mitigation 1')
		expect(result.mitigationSuggestions).toContain('Complexity mitigation 1')
		// Duplicates should be removed
		expect(result.mitigationSuggestions.length).toBe(3)
	})

	test('handles object description without text content correctly', () => {
		// Create an issue with an object description that doesn't have a standard format
		const mockIssueWithNonStandardDescription = {
			key: 'KNOW-127',
			fields: {
				summary: 'Task with non-standard object description',
				description: {
					// Object with properties but no text content
					someProperty: 'value',
					numericProperty: 123,
					nestedObject: {
						another: 'property',
					},
				},
				assignee: {
					displayName: 'Test User',
					accountId: 'user123',
				},
			},
		} as unknown as JiraIssue

		// Call the function
		const result = analyzeKnowledgeRisk(mockIssueWithNonStandardDescription, mockComments)

		// Verify detectRiskIndicators was called with the description toString value
		expect(detectRiskIndicators).toHaveBeenCalledWith(
			expect.stringContaining('[object Object]'),
			expect.any(Array),
			'Knowledge Risk',
		)

		// Result should still be valid
		expect(result).toHaveProperty('score')
		expect(result).toHaveProperty('riskItems')
		expect(result).toHaveProperty('mitigationSuggestions')
	})

	test('handles various non-string description types correctly', () => {
		// Test with various non-string types
		const testCases = [
			{
				description: 'Number as description',
				issue: {
					key: 'KNOW-128',
					fields: {
						summary: 'Task with number description',
						description: 123,
						assignee: {
							displayName: 'Test User',
							accountId: 'user123',
						},
					},
				} as unknown as JiraIssue,
			},
			{
				description: 'Boolean as description',
				issue: {
					key: 'KNOW-129',
					fields: {
						summary: 'Task with boolean description',
						description: true,
						assignee: {
							displayName: 'Test User',
							accountId: 'user123',
						},
					},
				} as unknown as JiraIssue,
			},
			{
				description: 'Array as description',
				issue: {
					key: 'KNOW-130',
					fields: {
						summary: 'Task with array description',
						description: ['item1', 'item2'],
						assignee: {
							displayName: 'Test User',
							accountId: 'user123',
						},
					},
				} as unknown as JiraIssue,
			},
			{
				description: 'Function as description',
				issue: {
					key: 'KNOW-131',
					fields: {
						summary: 'Task with function description',
						description: function () {
							return 'test'
						},
						assignee: {
							displayName: 'Test User',
							accountId: 'user123',
						},
					},
				} as unknown as JiraIssue,
			},
		]

		// Test each case
		testCases.forEach((testCase) => {
			// Reset mocks
			jest.clearAllMocks()

			// Call the function with the test issue
			const result = analyzeKnowledgeRisk(testCase.issue, mockComments)

			// Verify the function correctly works with various description types
			expect(detectRiskIndicators).toHaveBeenCalledTimes(2)

			// Check that the type was indeed converted to a string for detection
			const firstCallArg = (detectRiskIndicators as jest.Mock).mock.calls[0][0]
			expect(typeof firstCallArg).toBe('string')

			// Result should still be valid
			expect(result).toHaveProperty('score')
			expect(result).toHaveProperty('riskItems')
			expect(result).toHaveProperty('mitigationSuggestions')
		})
	})
})
