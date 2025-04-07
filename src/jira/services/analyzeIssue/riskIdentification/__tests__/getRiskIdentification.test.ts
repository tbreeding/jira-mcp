/**
 * Tests for the Risk Identification module
 *
 * This file contains tests for the getRiskIdentification function, which
 * identifies risks in Jira issues and generates risk assessments.
 */

import { analyzeDependencyRisk } from '../analyzeDependencyRisk'
import { analyzeInformationRisk } from '../analyzeInformationRisk'
import { analyzeKnowledgeRisk } from '../analyzeKnowledgeRisk'
import { analyzeTechnicalRisk } from '../analyzeTechnicalRisk'
import { analyzeTimelineRisk } from '../analyzeTimelineRisk'
import { getRiskIdentification } from '../getRiskIdentification'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'
import type { PreviousAnalysisResults, RiskCategoryResult } from '../types/riskIdentification.types'

// Mock the risk analyzer modules
jest.mock('../analyzeTechnicalRisk')
jest.mock('../analyzeDependencyRisk')
jest.mock('../analyzeTimelineRisk')
jest.mock('../analyzeKnowledgeRisk')
jest.mock('../analyzeInformationRisk')

describe('getRiskIdentification', () => {
	// Reset mocks before each test
	beforeEach(() => {
		jest.clearAllMocks()

		// Setup default mock implementations for risk analyzers
		const defaultMockResult: RiskCategoryResult = {
			score: 1,
			riskItems: [],
			mitigationSuggestions: [],
		}

		// Mock implementations for the risk analyzer functions
		;(analyzeTechnicalRisk as jest.Mock).mockReturnValue({ ...defaultMockResult })
		;(analyzeDependencyRisk as jest.Mock).mockReturnValue({ ...defaultMockResult })
		;(analyzeTimelineRisk as jest.Mock).mockReturnValue({ ...defaultMockResult })
		;(analyzeKnowledgeRisk as jest.Mock).mockReturnValue({ ...defaultMockResult })
		;(analyzeInformationRisk as jest.Mock).mockReturnValue({ ...defaultMockResult })
	})

	// Test data
	const mockIssue = {
		key: 'TEST-123',
		fields: {
			summary: 'Test issue',
			description: 'Test description',
			issuetype: {
				name: 'Task',
			},
		},
	} as unknown as JiraIssue

	const mockComments: IssueCommentResponse = {
		comments: [
			{
				id: '1',
				body: 'Test comment',
			} as any,
		],
		total: 1,
		startAt: 0,
		maxResults: 1,
	}

	test('calls all risk analyzers with correct parameters', () => {
		// Call the function with test data
		getRiskIdentification(mockIssue, mockComments)

		// Verify that each analyzer was called with the correct parameters
		expect(analyzeTechnicalRisk).toHaveBeenCalledWith(mockIssue, mockComments)
		expect(analyzeDependencyRisk).toHaveBeenCalledWith(mockIssue, mockComments, undefined)
		expect(analyzeTimelineRisk).toHaveBeenCalledWith(mockIssue, mockComments, undefined)
		expect(analyzeKnowledgeRisk).toHaveBeenCalledWith(mockIssue, mockComments, undefined)
		expect(analyzeInformationRisk).toHaveBeenCalledWith(mockIssue, mockComments, undefined)
	})

	test('passes previousResults to risk analyzers when provided', () => {
		// Previous analysis results mock
		const mockPreviousResults: PreviousAnalysisResults = {
			complexity: { score: 8, factors: ['Complex logic'], level: 'complex' as const },
			dependencies: { blockers: [], relatedIssues: [], implicitDependencies: [], externalDependencies: [] },
		}

		// Call the function with test data and previous results
		getRiskIdentification(mockIssue, mockComments, mockPreviousResults)

		// Verify that each analyzer except the technical one was called with previous results
		expect(analyzeTechnicalRisk).toHaveBeenCalledWith(mockIssue, mockComments)
		expect(analyzeDependencyRisk).toHaveBeenCalledWith(mockIssue, mockComments, mockPreviousResults)
		expect(analyzeTimelineRisk).toHaveBeenCalledWith(mockIssue, mockComments, mockPreviousResults)
		expect(analyzeKnowledgeRisk).toHaveBeenCalledWith(mockIssue, mockComments, mockPreviousResults)
		expect(analyzeInformationRisk).toHaveBeenCalledWith(mockIssue, mockComments, mockPreviousResults)
	})

	test('aggregates risk items from all analyzers', () => {
		// Setup mock implementations to return specific risk items
		;(analyzeTechnicalRisk as jest.Mock).mockReturnValue({
			score: 5,
			riskItems: ['Technical risk 1'],
			mitigationSuggestions: ['Tech mitigation 1'],
		})
		;(analyzeDependencyRisk as jest.Mock).mockReturnValue({
			score: 3,
			riskItems: ['Dependency risk 1'],
			mitigationSuggestions: ['Dependency mitigation 1'],
		})
		;(analyzeTimelineRisk as jest.Mock).mockReturnValue({
			score: 7,
			riskItems: ['Timeline risk 1'],
			mitigationSuggestions: ['Timeline mitigation 1'],
		})

		// Call the function
		const result = getRiskIdentification(mockIssue, mockComments)

		// Verify that the risk items are combined correctly
		expect(result.items).toContain('Technical risk 1')
		expect(result.items).toContain('Dependency risk 1')
		expect(result.items).toContain('Timeline risk 1')
		expect(result.items.length).toBe(3)

		// Verify that the mitigation suggestions are combined correctly
		expect(result.mitigationSuggestions).toContain('Tech mitigation 1')
		expect(result.mitigationSuggestions).toContain('Dependency mitigation 1')
		expect(result.mitigationSuggestions).toContain('Timeline mitigation 1')
	})

	test('calculates a reasonable score based on all risk categories', () => {
		// Setup mock implementations with various scores
		;(analyzeTechnicalRisk as jest.Mock).mockReturnValue({ score: 8, riskItems: [], mitigationSuggestions: [] })
		;(analyzeDependencyRisk as jest.Mock).mockReturnValue({ score: 5, riskItems: [], mitigationSuggestions: [] })
		;(analyzeTimelineRisk as jest.Mock).mockReturnValue({ score: 7, riskItems: [], mitigationSuggestions: [] })
		;(analyzeKnowledgeRisk as jest.Mock).mockReturnValue({ score: 3, riskItems: [], mitigationSuggestions: [] })
		;(analyzeInformationRisk as jest.Mock).mockReturnValue({ score: 2, riskItems: [], mitigationSuggestions: [] })

		// Call the function
		const result = getRiskIdentification(mockIssue, mockComments)

		// The expected score would be in the range of 5-6 based on the weights defined in calculateRiskScore
		expect(result.score).toBeGreaterThan(4)
		expect(result.score).toBeLessThan(7)
	})

	test('removes duplicate mitigation suggestions', () => {
		// Setup mock implementations with duplicate suggestions
		const duplicateSuggestion = 'Duplicate mitigation suggestion'

		;(analyzeTechnicalRisk as jest.Mock).mockReturnValue({
			score: 5,
			riskItems: [],
			mitigationSuggestions: [duplicateSuggestion, 'Tech suggestion'],
		})
		;(analyzeDependencyRisk as jest.Mock).mockReturnValue({
			score: 3,
			riskItems: [],
			mitigationSuggestions: [duplicateSuggestion, 'Dependency suggestion'],
		})

		// Call the function
		const result = getRiskIdentification(mockIssue, mockComments)

		// Verify that the duplicate suggestion appears only once
		const occurrences = result.mitigationSuggestions.filter((s) => s === duplicateSuggestion).length
		expect(occurrences).toBe(1)

		// Verify that the total number of suggestions is correct
		expect(result.mitigationSuggestions).toContain(duplicateSuggestion)
		expect(result.mitigationSuggestions).toContain('Tech suggestion')
		expect(result.mitigationSuggestions).toContain('Dependency suggestion')
	})
})
