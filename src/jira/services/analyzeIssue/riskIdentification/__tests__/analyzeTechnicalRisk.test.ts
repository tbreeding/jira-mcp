/**
 * Tests for Technical Risk Analysis
 *
 * This file contains tests for the analyzeTechnicalRisk function, which
 * identifies technical risks in Jira issues.
 */

import { analyzeTechnicalRisk } from '../analyzeTechnicalRisk'
import { detectRiskIndicators } from '../utils/detectRiskIndicators'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'

// Mock utilities
jest.mock('../utils/detectRiskIndicators')

describe('analyzeTechnicalRisk', () => {
	beforeEach(() => {
		jest.clearAllMocks()

		// Default mock implementation
		const defaultMockResult = {
			present: false,
			indicators: [],
			severity: 'low',
		}

		// Mock implementation for detectRiskIndicators
		;(detectRiskIndicators as jest.Mock).mockReturnValue({ ...defaultMockResult })
	})

	// Test data
	const mockIssue = {
		key: 'TECH-123',
		fields: {
			summary: 'Implement new feature',
			description: 'This is a test description',
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

	// This test specifically tests the case with null description
	test('handles null description gracefully', () => {
		const issueWithNullDescription = {
			...mockIssue,
			fields: {
				...mockIssue.fields,
				description: null,
			},
		} as unknown as JiraIssue

		const result = analyzeTechnicalRisk(issueWithNullDescription, mockComments)

		// Result should be calculated based only on comments
		expect(result).toBeDefined()
		expect(result.score).toBeDefined()
		expect(result.riskItems).toBeDefined()
		expect(result.mitigationSuggestions).toBeDefined()
	})

	// This test specifically tests the case with empty comments
	test('handles empty comments gracefully', () => {
		const emptyComments: IssueCommentResponse = {
			comments: [],
			total: 0,
			startAt: 0,
			maxResults: 0,
		}

		const result = analyzeTechnicalRisk(mockIssue, emptyComments)

		// Result should be calculated based only on description
		expect(result).toBeDefined()
		expect(result.score).toBeDefined()
		expect(result.riskItems).toBeDefined()
		expect(result.mitigationSuggestions).toBeDefined()
	})

	// This test specifically tests the case with comments containing null bodies
	test('handles null comment bodies gracefully', () => {
		const commentsWithNullBodies: IssueCommentResponse = {
			comments: [
				{
					id: '1',
					body: null,
				} as any,
				{
					id: '2',
					body: 'Valid comment',
				} as any,
			],
			total: 2,
			startAt: 0,
			maxResults: 2,
		}

		const result = analyzeTechnicalRisk(mockIssue, commentsWithNullBodies)

		// Result should be calculated based on description and valid comments
		expect(result).toBeDefined()
		expect(result.score).toBeDefined()
		expect(result.riskItems).toBeDefined()
		expect(result.mitigationSuggestions).toBeDefined()
	})

	test('detects technical debt risks', () => {
		// Setup mock implementation for technical debt detection
		;(detectRiskIndicators as jest.Mock).mockImplementation((text, patterns, category) => {
			if (category === 'Technical Debt Risk') {
				return {
					present: true,
					indicators: ['Technical Debt Risk: technical debt found in text'],
					severity: 'high',
				}
			}
			return {
				present: false,
				indicators: [],
				severity: 'low',
			}
		})

		// Call the function
		const result = analyzeTechnicalRisk(mockIssue, mockComments)

		// Verify detector was called correctly
		expect(detectRiskIndicators).toHaveBeenCalledWith(expect.any(String), expect.any(Array), 'Technical Debt Risk')

		// Verify results
		expect(result.score).toBeGreaterThan(1) // Score should be increased
		expect(result.riskItems).toContainEqual(expect.stringContaining('High technical debt risk'))
		expect(result.mitigationSuggestions).toContainEqual(expect.stringContaining('refactoring'))
	})

	test('detects security risks', () => {
		// Setup mock implementation for security risk detection
		;(detectRiskIndicators as jest.Mock).mockImplementation((text, patterns, category) => {
			if (category === 'Security Risk') {
				return {
					present: true,
					indicators: ['Security Risk: security concern found in text'],
					severity: 'medium',
				}
			}
			return {
				present: false,
				indicators: [],
				severity: 'low',
			}
		})

		// Call the function
		const result = analyzeTechnicalRisk(mockIssue, mockComments)

		// Verify detector was called correctly
		expect(detectRiskIndicators).toHaveBeenCalledWith(expect.any(String), expect.any(Array), 'Security Risk')

		// Verify results
		expect(result.score).toBeGreaterThan(1) // Score should be increased
		expect(result.riskItems).toContainEqual(expect.stringContaining('Security risk'))
		expect(result.mitigationSuggestions).toContainEqual(expect.stringContaining('security review'))
	})

	test('detects performance risks', () => {
		// Setup mock implementation for performance risk detection
		;(detectRiskIndicators as jest.Mock).mockImplementation((text, patterns, category) => {
			if (category === 'Performance Risk') {
				return {
					present: true,
					indicators: ['Performance Risk: performance concern found in text'],
					severity: 'medium',
				}
			}
			return {
				present: false,
				indicators: [],
				severity: 'low',
			}
		})

		// Call the function
		const result = analyzeTechnicalRisk(mockIssue, mockComments)

		// Verify results
		expect(result.riskItems).toContainEqual(expect.stringContaining('Performance concern'))
		expect(result.mitigationSuggestions).toContainEqual(expect.stringContaining('performance acceptance criteria'))
	})

	test('detects architecture risks', () => {
		// Setup mock implementation for architecture risk detection
		;(detectRiskIndicators as jest.Mock).mockImplementation((text, patterns, category) => {
			if (category === 'Architecture Impact Risk') {
				return {
					present: true,
					indicators: ['Architecture Impact Risk: architecture impact found in text'],
					severity: 'high',
				}
			}
			return {
				present: false,
				indicators: [],
				severity: 'low',
			}
		})

		// Call the function
		const result = analyzeTechnicalRisk(mockIssue, mockComments)

		// Verify results
		expect(result.riskItems).toContainEqual(expect.stringContaining('Architecture impact risk'))
		expect(result.mitigationSuggestions).toContainEqual(expect.stringContaining('architecture review'))
	})

	test('combines multiple risk types', () => {
		// Setup mock implementation for multiple risk types
		let callCount = 0
		;(detectRiskIndicators as jest.Mock).mockImplementation(() => {
			callCount++

			// Return different results based on which category is being checked
			if (callCount === 1) {
				// Technical Debt
				return {
					present: true,
					indicators: ['Technical Debt Risk: technical debt found in text'],
					severity: 'medium',
				}
			} else if (callCount === 3) {
				// Performance (3rd call)
				return {
					present: true,
					indicators: ['Performance Risk: performance concern found in text'],
					severity: 'low',
				}
			}

			return {
				present: false,
				indicators: [],
				severity: 'low',
			}
		})

		// Call the function
		const result = analyzeTechnicalRisk(mockIssue, mockComments)

		// Verify results
		expect(result.riskItems.length).toBe(2) // Should have 2 risk items
		expect(result.mitigationSuggestions.length).toBe(2) // Should have 2 mitigation suggestions
		expect(result.score).toBeGreaterThan(2) // Score should reflect multiple risks
	})

	test('returns appropriate score for high severity risks', () => {
		// Setup mock implementation for high severity risk
		;(detectRiskIndicators as jest.Mock).mockImplementation(() => ({
			present: true,
			indicators: ['High severity risk'],
			severity: 'high',
		}))

		// Call the function
		const result = analyzeTechnicalRisk(mockIssue, mockComments)

		// Verify the score is appropriately high
		expect(result.score).toBeGreaterThan(7)
	})

	test('handles no risks detected gracefully', () => {
		// Setup mock to return no risks
		;(detectRiskIndicators as jest.Mock).mockReturnValue({
			present: false,
			indicators: [],
			severity: 'low',
		})

		const result = analyzeTechnicalRisk(mockIssue, mockComments)

		// Should have low score and no specific risks
		expect(result.score).toBeLessThan(3)
		expect(result.riskItems.length).toBe(0)
		expect(result.mitigationSuggestions).toBeDefined()
	})
})
