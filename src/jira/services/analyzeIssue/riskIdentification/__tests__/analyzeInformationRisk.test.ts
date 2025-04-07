/**
 * Tests for Information Risk Analysis
 *
 * This file contains tests for the analyzeInformationRisk function, which
 * identifies information quality risks in Jira issues.
 */

import { analyzeInformationRisk } from '../analyzeInformationRisk'
import {
	processRequirementsGapIndicators,
	processAmbiguityIndicators,
	checkForMissingDescription,
} from '../helpers/informationRiskHelpers'
import { processCompletenessEvaluation } from '../helpers/processCompletenessEvaluation'
import { detectRiskIndicators } from '../utils/detectRiskIndicators'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'
import type { PreviousAnalysisResults } from '../types/riskIdentification.types'

// Mock dependencies
jest.mock('../utils/detectRiskIndicators')
jest.mock('../helpers/informationRiskHelpers')
jest.mock('../helpers/processCompletenessEvaluation')

describe('analyzeInformationRisk', () => {
	beforeEach(() => {
		jest.clearAllMocks()

		// Default mock implementations
		;(detectRiskIndicators as jest.Mock).mockReturnValue({
			present: false,
			indicators: [],
			severity: 'low',
		})
		;(processRequirementsGapIndicators as jest.Mock).mockReturnValue(0)
		;(processAmbiguityIndicators as jest.Mock).mockReturnValue(0)
		;(processCompletenessEvaluation as jest.Mock).mockReturnValue(0)
		;(checkForMissingDescription as jest.Mock).mockReturnValue(0)
	})

	// Test data
	const mockIssue = {
		key: 'INFO-123',
		fields: {
			summary: 'Task with information risks',
			description: 'This is a description',
		},
	} as unknown as JiraIssue

	const mockEmptyDescriptionIssue = {
		key: 'INFO-124',
		fields: {
			summary: 'Task with empty description',
			description: '',
		},
	} as unknown as JiraIssue

	const mockComments: IssueCommentResponse = {
		comments: [
			{
				id: '1',
				body: 'Comment about information',
			} as any,
		],
		total: 1,
		startAt: 0,
		maxResults: 1,
	}

	const mockPreviousResults = {
		completeness: {
			score: 60,
			missingCategories: ['Acceptance Criteria'],
		},
	} as unknown as PreviousAnalysisResults

	test('calls detectRiskIndicators with correct parameters for requirements and ambiguity', () => {
		// Call the function
		analyzeInformationRisk(mockIssue, mockComments)

		// Verify detectRiskIndicators was called twice with correct parameters
		expect(detectRiskIndicators).toHaveBeenCalledTimes(2)
		expect(detectRiskIndicators).toHaveBeenNthCalledWith(
			1,
			'This is a description Comment about information',
			expect.any(Array),
			'Requirements Gap Risk',
		)
		expect(detectRiskIndicators).toHaveBeenNthCalledWith(
			2,
			'This is a description Comment about information',
			expect.any(Array),
			'Ambiguity Risk',
		)
	})

	test('calls processRequirementsGapIndicators and processAmbiguityIndicators with results', () => {
		// Setup mock for detectRiskIndicators to return different values for each call
		const requirementsResult = {
			present: true,
			indicators: ['Requirements gap indicator'],
			severity: 'medium',
		}

		const ambiguityResult = {
			present: true,
			indicators: ['Ambiguity indicator'],
			severity: 'high',
		}

		;(detectRiskIndicators as jest.Mock).mockReturnValueOnce(requirementsResult).mockReturnValueOnce(ambiguityResult)

		// Call the function
		analyzeInformationRisk(mockIssue, mockComments)

		// Verify both processing functions are called with correct parameters
		expect(processRequirementsGapIndicators).toHaveBeenCalledWith(
			requirementsResult,
			expect.any(Array),
			expect.any(Array),
		)

		expect(processAmbiguityIndicators).toHaveBeenCalledWith(ambiguityResult, expect.any(Array), expect.any(Array))
	})

	test('processes previous completeness evaluation when available', () => {
		// Call with previous results
		analyzeInformationRisk(mockIssue, mockComments, mockPreviousResults)

		// Verify processCompletenessEvaluation is called with correct parameters
		expect(processCompletenessEvaluation).toHaveBeenCalledWith(
			mockPreviousResults.completeness,
			expect.any(Array),
			expect.any(Array),
		)
	})

	test('does not process completeness when no previous results', () => {
		// Call without previous results
		analyzeInformationRisk(mockIssue, mockComments)

		// Verify processCompletenessEvaluation is not called
		expect(processCompletenessEvaluation).not.toHaveBeenCalled()
	})

	test('checks for missing description', () => {
		// Call with issue with empty description
		analyzeInformationRisk(mockEmptyDescriptionIssue, mockComments)

		// Verify checkForMissingDescription is called with empty string
		expect(checkForMissingDescription).toHaveBeenCalledWith('', expect.any(Array), expect.any(Array))
	})

	test('calculates combined risk score correctly', () => {
		// Setup mocks to return specific score increases
		;(processRequirementsGapIndicators as jest.Mock).mockReturnValue(2)
		;(processAmbiguityIndicators as jest.Mock).mockReturnValue(1)
		;(processCompletenessEvaluation as jest.Mock).mockReturnValue(3)
		;(checkForMissingDescription as jest.Mock).mockReturnValue(0)

		// Call the function with previous results
		const result = analyzeInformationRisk(mockIssue, mockComments, mockPreviousResults)

		// Base score (1) + requirements (2) + ambiguity (1) + completeness (3) = 7
		expect(result.score).toBe(7)
	})

	test('ensures score is capped at maximum of 10', () => {
		// Setup mocks to return large score increases
		;(processRequirementsGapIndicators as jest.Mock).mockReturnValue(4)
		;(processAmbiguityIndicators as jest.Mock).mockReturnValue(3)
		;(processCompletenessEvaluation as jest.Mock).mockReturnValue(5)
		;(checkForMissingDescription as jest.Mock).mockReturnValue(2)

		// Call the function with previous results
		const result = analyzeInformationRisk(mockIssue, mockComments, mockPreviousResults)

		// Score would be 15 but should be capped at 10
		expect(result.score).toBe(10)
	})

	test('ensures score is at minimum of 1', () => {
		// Setup mocks to return negative score increases
		;(processRequirementsGapIndicators as jest.Mock).mockReturnValue(-2)
		;(processAmbiguityIndicators as jest.Mock).mockReturnValue(-3)
		;(checkForMissingDescription as jest.Mock).mockReturnValue(0)

		// Call the function without previous results
		const result = analyzeInformationRisk(mockIssue, mockComments)

		// Score would be -4 but should be minimum 1
		expect(result.score).toBe(1)
	})

	test('handles description field when it is a complex object instead of string', () => {
		// Create a mock issue with an object as description
		const complexDescriptionIssue = {
			key: 'INFO-125',
			fields: {
				summary: 'Task with object description',
				description: { content: [{ type: 'text', text: 'Description content' }] },
			},
		} as unknown as JiraIssue

		// Call the function with the complex description issue
		const result = analyzeInformationRisk(complexDescriptionIssue, mockComments)

		// Verify checkForMissingDescription is called with empty string (as it can't extract from object)
		expect(checkForMissingDescription).toHaveBeenCalledWith('', expect.any(Array), expect.any(Array))

		// Result should still be valid
		expect(result).toHaveProperty('score')
		expect(result).toHaveProperty('riskItems')
		expect(result).toHaveProperty('mitigationSuggestions')
	})

	test('combines risk items and mitigation suggestions', () => {
		// Setup mocks to modify riskItems and mitigationSuggestions arrays
		;(processRequirementsGapIndicators as jest.Mock).mockImplementation((result, riskItems, mitigationSuggestions) => {
			riskItems.push('Requirements risk 1')
			mitigationSuggestions.push('Requirements mitigation 1')
			return 1
		})
		;(processAmbiguityIndicators as jest.Mock).mockImplementation((result, riskItems, mitigationSuggestions) => {
			riskItems.push('Ambiguity risk 1')
			mitigationSuggestions.push('Ambiguity mitigation 1')
			return 1
		})
		;(processCompletenessEvaluation as jest.Mock).mockImplementation(
			(completeness, riskItems, mitigationSuggestions) => {
				riskItems.push('Completeness risk 1')
				mitigationSuggestions.push('Completeness mitigation 1')
				mitigationSuggestions.push('Ambiguity mitigation 1') // Duplicate
				return 1
			},
		)
		;(checkForMissingDescription as jest.Mock).mockImplementation((description, riskItems, mitigationSuggestions) => {
			riskItems.push('Description risk 1')
			mitigationSuggestions.push('Description mitigation 1')
			return 1
		})

		// Call the function with previous results
		const result = analyzeInformationRisk(mockIssue, mockComments, mockPreviousResults)

		// Verify risk items are combined correctly
		expect(result.riskItems).toContain('Requirements risk 1')
		expect(result.riskItems).toContain('Ambiguity risk 1')
		expect(result.riskItems).toContain('Completeness risk 1')
		expect(result.riskItems).toContain('Description risk 1')
		expect(result.riskItems.length).toBe(4)

		// Verify mitigation suggestions are combined and deduplicated
		expect(result.mitigationSuggestions).toContain('Requirements mitigation 1')
		expect(result.mitigationSuggestions).toContain('Ambiguity mitigation 1')
		expect(result.mitigationSuggestions).toContain('Completeness mitigation 1')
		expect(result.mitigationSuggestions).toContain('Description mitigation 1')
		// Duplicates should be removed, so we expect 4 unique suggestions
		expect(result.mitigationSuggestions.length).toBe(4)
	})

	test('handles object description correctly', () => {
		// Create an issue with an object description (ADF format)
		const mockIssueWithObjectDescription = {
			key: 'INFO-125',
			fields: {
				summary: 'Task with object description',
				description: {
					type: 'doc',
					content: [{ type: 'paragraph', content: [{ type: 'text', text: 'ADF content' }] }],
				},
			},
		} as unknown as JiraIssue

		// Call the function
		analyzeInformationRisk(mockIssueWithObjectDescription, mockComments)

		// Verify description is treated as empty string
		expect(checkForMissingDescription).toHaveBeenCalledWith('', expect.any(Array), expect.any(Array))
	})

	test('handles null description', () => {
		// Create issue with null description
		const mockNullDescriptionIssue = {
			key: 'INFO-125',
			fields: {
				summary: 'Task with null description',
				description: null,
			},
		} as unknown as JiraIssue

		// Call the function
		analyzeInformationRisk(mockNullDescriptionIssue, mockComments)

		// Verify detectRiskIndicators was called with empty string for the description
		expect(detectRiskIndicators).toHaveBeenCalledTimes(2)
		expect(detectRiskIndicators).toHaveBeenNthCalledWith(
			1,
			' Comment about information',
			expect.any(Array),
			'Requirements Gap Risk',
		)

		// Verify checkForMissingDescription is called with empty string
		expect(checkForMissingDescription).toHaveBeenCalledWith('', expect.any(Array), expect.any(Array))
	})

	test('handles undefined description', () => {
		// Create issue with undefined description
		const mockUndefinedDescriptionIssue = {
			key: 'INFO-126',
			fields: {
				summary: 'Task with undefined description',
				description: undefined,
			},
		} as unknown as JiraIssue

		// Call the function
		const result = analyzeInformationRisk(mockUndefinedDescriptionIssue, mockComments)

		// Verify checkForMissingDescription is called with empty string
		expect(checkForMissingDescription).toHaveBeenCalledWith('', expect.any(Array), expect.any(Array))

		// Result should still be valid
		expect(result).toHaveProperty('score')
		expect(result).toHaveProperty('riskItems')
		expect(result).toHaveProperty('mitigationSuggestions')
	})

	test('handles object description type checking correctly', () => {
		// Create a mock issue with an object description
		const complexDescriptionIssue = {
			key: 'INFO-127',
			fields: {
				summary: 'Task with complex object description',
				// Create a description that is neither a string nor contains text property
				description: {
					someData: 'value',
					otherData: 123,
				},
			},
		} as unknown as JiraIssue

		// Call the function with the complex description issue
		const result = analyzeInformationRisk(complexDescriptionIssue, mockComments)

		// Verify checkForMissingDescription is called with empty string
		// This specifically tests the typeof descriptionText === 'string' branch
		expect(checkForMissingDescription).toHaveBeenCalledWith('', expect.any(Array), expect.any(Array))

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
					key: 'INFO-128',
					fields: {
						summary: 'Task with number description',
						description: 123,
					},
				} as unknown as JiraIssue,
			},
			{
				description: 'Boolean as description',
				issue: {
					key: 'INFO-129',
					fields: {
						summary: 'Task with boolean description',
						description: true,
					},
				} as unknown as JiraIssue,
			},
			{
				description: 'Array as description',
				issue: {
					key: 'INFO-130',
					fields: {
						summary: 'Task with array description',
						description: ['item1', 'item2'],
					},
				} as unknown as JiraIssue,
			},
			{
				description: 'Function as description',
				issue: {
					key: 'INFO-131',
					fields: {
						summary: 'Task with function description',
						description: function () {
							return 'test'
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
			const result = analyzeInformationRisk(testCase.issue, mockComments)

			// Verify checkForMissingDescription is called with empty string
			// This specifically tests the typeof descriptionText === 'string' branch
			expect(checkForMissingDescription).toHaveBeenCalledWith('', expect.any(Array), expect.any(Array))

			// Result should still be valid
			expect(result).toHaveProperty('score')
			expect(result).toHaveProperty('riskItems')
			expect(result).toHaveProperty('mitigationSuggestions')
		})
	})
})
