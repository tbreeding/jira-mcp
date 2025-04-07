/**
 * Tests for Dependency Risk Analysis
 *
 * This file contains tests for the analyzeDependencyRisk function, which
 * identifies dependency-related risks in Jira issues.
 */

import { analyzeDependencyRisk } from '../analyzeDependencyRisk'
import { analyzePreviousDependencies } from '../helpers/dependencyRisk/analyzePreviousDependencies'
import { analyzeTextDependencies } from '../helpers/dependencyRisk/analyzeTextDependencies'
import { extractTextForAnalysis } from '../helpers/dependencyRisk/extractTextForAnalysis'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'
import type { PreviousAnalysisResults } from '../types/riskIdentification.types'

// Mock dependencies
jest.mock('../helpers/dependencyRisk/extractTextForAnalysis')
jest.mock('../helpers/dependencyRisk/analyzeTextDependencies')
jest.mock('../helpers/dependencyRisk/analyzePreviousDependencies')

describe('analyzeDependencyRisk', () => {
	beforeEach(() => {
		jest.clearAllMocks()

		// Default mock implementations
		;(extractTextForAnalysis as jest.Mock).mockReturnValue('extracted text')
		;(analyzeTextDependencies as jest.Mock).mockReturnValue({
			scoreIncrease: 0,
			riskItems: [],
			mitigationSuggestions: [],
		})
		;(analyzePreviousDependencies as jest.Mock).mockReturnValue({
			scoreIncrease: 0,
			riskItems: [],
			mitigationSuggestions: [],
		})
	})

	// Test data
	const mockIssue = {
		key: 'DEP-123',
		fields: {
			summary: 'Task with dependencies',
			description: 'Description with dependencies',
		},
	} as unknown as JiraIssue

	const mockComments: IssueCommentResponse = {
		comments: [
			{
				id: '1',
				body: 'Comment about dependency',
			} as any,
		],
		total: 1,
		startAt: 0,
		maxResults: 1,
	}

	const mockPreviousResults = {
		dependencies: {
			hasBlockers: true,
			externalDependencies: ['Team X', 'System Y'],
		},
	} as unknown as PreviousAnalysisResults

	test('calls dependencies with correct parameters', () => {
		// Call the function
		analyzeDependencyRisk(mockIssue, mockComments)

		// Verify correct parameters are passed to dependencies
		expect(extractTextForAnalysis).toHaveBeenCalledWith(mockIssue, mockComments)
		expect(analyzeTextDependencies).toHaveBeenCalledWith('extracted text')
		expect(analyzePreviousDependencies).toHaveBeenCalledWith(undefined)
	})

	test('passes previous results when available', () => {
		// Call with previous results
		analyzeDependencyRisk(mockIssue, mockComments, mockPreviousResults)

		// Verify previous results are passed
		expect(analyzePreviousDependencies).toHaveBeenCalledWith(mockPreviousResults.dependencies)
	})

	test('combines risk items from text and previous analysis', () => {
		// Setup mocks to return risk items
		;(analyzeTextDependencies as jest.Mock).mockReturnValue({
			scoreIncrease: 1,
			riskItems: ['Text dependency risk 1'],
			mitigationSuggestions: ['Text mitigation 1'],
		})
		;(analyzePreviousDependencies as jest.Mock).mockReturnValue({
			scoreIncrease: 2,
			riskItems: ['Previous dependency risk 1', 'Previous dependency risk 2'],
			mitigationSuggestions: ['Previous mitigation 1'],
		})

		// Call the function
		const result = analyzeDependencyRisk(mockIssue, mockComments, mockPreviousResults)

		// Verify risk items are combined
		expect(result.riskItems).toContain('Text dependency risk 1')
		expect(result.riskItems).toContain('Previous dependency risk 1')
		expect(result.riskItems).toContain('Previous dependency risk 2')
		expect(result.riskItems.length).toBe(3)

		// Verify mitigation suggestions are combined and deduplicated
		expect(result.mitigationSuggestions).toContain('Text mitigation 1')
		expect(result.mitigationSuggestions).toContain('Previous mitigation 1')
		expect(result.mitigationSuggestions.length).toBe(2)
	})

	test('calculates score based on text and previous analysis', () => {
		// Setup mocks with specific score increases
		;(analyzeTextDependencies as jest.Mock).mockReturnValue({
			scoreIncrease: 3,
			riskItems: [],
			mitigationSuggestions: [],
		})
		;(analyzePreviousDependencies as jest.Mock).mockReturnValue({
			scoreIncrease: 2,
			riskItems: [],
			mitigationSuggestions: [],
		})

		// Call the function
		const result = analyzeDependencyRisk(mockIssue, mockComments, mockPreviousResults)

		// Base score (1) + text increase (3) + previous increase (2) = 6
		expect(result.score).toBe(6)
	})

	test('handles duplicate mitigation suggestions', () => {
		// Setup mocks with duplicate suggestions
		;(analyzeTextDependencies as jest.Mock).mockReturnValue({
			scoreIncrease: 1,
			riskItems: [],
			mitigationSuggestions: ['Duplicate suggestion', 'Unique suggestion 1'],
		})
		;(analyzePreviousDependencies as jest.Mock).mockReturnValue({
			scoreIncrease: 1,
			riskItems: [],
			mitigationSuggestions: ['Duplicate suggestion', 'Unique suggestion 2'],
		})

		// Call the function
		const result = analyzeDependencyRisk(mockIssue, mockComments, mockPreviousResults)

		// Verify duplicates are removed
		expect(result.mitigationSuggestions.length).toBe(3)
		expect(result.mitigationSuggestions).toContain('Duplicate suggestion')
		expect(result.mitigationSuggestions).toContain('Unique suggestion 1')
		expect(result.mitigationSuggestions).toContain('Unique suggestion 2')
	})

	test('ensures score is capped at maximum of 10', () => {
		// Setup mocks with large score increases
		;(analyzeTextDependencies as jest.Mock).mockReturnValue({
			scoreIncrease: 5,
			riskItems: [],
			mitigationSuggestions: [],
		})
		;(analyzePreviousDependencies as jest.Mock).mockReturnValue({
			scoreIncrease: 6,
			riskItems: [],
			mitigationSuggestions: [],
		})

		// Call the function
		const result = analyzeDependencyRisk(mockIssue, mockComments, mockPreviousResults)

		// Score should be capped at 10 (base 1 + 5 + 6 = 12, but capped at 10)
		expect(result.score).toBe(10)
	})

	test('ensures score is at minimum of 1', () => {
		// Setup mocks with negative score increases
		;(analyzeTextDependencies as jest.Mock).mockReturnValue({
			scoreIncrease: -5,
			riskItems: [],
			mitigationSuggestions: [],
		})
		;(analyzePreviousDependencies as jest.Mock).mockReturnValue({
			scoreIncrease: 0,
			riskItems: [],
			mitigationSuggestions: [],
		})

		// Call the function
		const result = analyzeDependencyRisk(mockIssue, mockComments, mockPreviousResults)

		// Score should be minimum 1 (base 1 + (-5) = -4, but minimum is 1)
		expect(result.score).toBe(1)
	})
})
