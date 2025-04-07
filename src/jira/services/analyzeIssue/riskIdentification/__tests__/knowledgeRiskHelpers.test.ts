/**
 * Tests for knowledge risk helper functions
 */

import { detectAssigneeConcentrationRisk } from '../helpers/assigneeRiskHelpers'
import { processComplexityAnalysis } from '../helpers/complexityRiskHelpers'
import {
	processKnowledgeConcentrationIndicators,
	processSpecializedTechnologyIndicators,
} from '../helpers/knowledgeTextAnalysisHelpers'
import type { JiraIssue } from '../../../../types/issue.types'
import type { RiskIndicatorResult } from '../types/riskIdentification.types'

describe('Knowledge Risk Helpers', () => {
	describe('detectAssigneeConcentrationRisk', () => {
		test('returns risk message if issue has no assignee', () => {
			const mockIssue = {
				fields: {
					assignee: null,
				},
			} as unknown as JiraIssue

			const result = detectAssigneeConcentrationRisk(mockIssue)

			expect(result).not.toBeNull()
			expect(result).toContain('not assigned to anyone')
		})

		test('returns null if issue has an assignee', () => {
			const mockIssue = {
				fields: {
					assignee: {
						displayName: 'Test User',
					},
				},
			} as unknown as JiraIssue

			const result = detectAssigneeConcentrationRisk(mockIssue)

			expect(result).toBeNull()
		})
	})

	describe('processKnowledgeConcentrationIndicators', () => {
		test('returns 0 if no indicators present', () => {
			const result: RiskIndicatorResult = {
				present: false,
				indicators: [],
				severity: 'low',
			}
			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processKnowledgeConcentrationIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(0)
			expect(riskItems.length).toBe(0)
			expect(mitigationSuggestions.length).toBe(0)
		})

		test('processes high severity knowledge concentration correctly', () => {
			const result: RiskIndicatorResult = {
				present: true,
				indicators: ['Knowledge Risk: tribal knowledge found in text'],
				severity: 'high',
			}
			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processKnowledgeConcentrationIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(3)
			expect(riskItems.length).toBe(1)
			expect(riskItems[0]).toContain('Knowledge concentration risk:')
			expect(mitigationSuggestions.length).toBe(2)
			expect(mitigationSuggestions[0]).toContain('knowledge sharing sessions')
		})
	})

	describe('processSpecializedTechnologyIndicators', () => {
		test('processes medium severity technology risk correctly', () => {
			const result: RiskIndicatorResult = {
				present: true,
				indicators: ['Specialized Technology Risk: legacy found in text'],
				severity: 'medium',
			}
			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processSpecializedTechnologyIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(2)
			expect(riskItems.length).toBe(1)
			expect(riskItems[0]).toContain('Specialized technology risk:')
			expect(mitigationSuggestions.length).toBe(1)
			expect(mitigationSuggestions[0]).toContain('Create documentation for specialized technologies')
		})
	})

	describe('processComplexityAnalysis', () => {
		test('returns 0 if not very complex', () => {
			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processComplexityAnalysis('medium', riskItems, mitigationSuggestions)

			expect(score).toBe(0)
			expect(riskItems.length).toBe(0)
			expect(mitigationSuggestions.length).toBe(0)
		})

		test('returns 2 for very complex issues', () => {
			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processComplexityAnalysis('very complex', riskItems, mitigationSuggestions)

			expect(score).toBe(2)
			expect(riskItems.length).toBe(1)
			expect(riskItems[0]).toContain('very complex')
			expect(mitigationSuggestions.length).toBe(1)
			expect(mitigationSuggestions[0]).toContain('well-documented')
		})
	})
})
