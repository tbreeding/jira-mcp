/**
 * Tests for completeness evaluation processing
 */

import { processCompletenessEvaluation } from '../helpers/processCompletenessEvaluation'
import type { CompletenessEvaluation } from '../../completenessEvaluation/completenessEvaluation.types'

describe('processCompletenessEvaluation', () => {
	test('processes low completeness score correctly', () => {
		const completenessData: CompletenessEvaluation = {
			score: 4,
			missingInformation: [],
			suggestions: [],
		} as CompletenessEvaluation

		const riskItems: string[] = []
		const mitigationSuggestions: string[] = []

		const score = processCompletenessEvaluation(completenessData, riskItems, mitigationSuggestions)

		expect(score).toBe(3)
		expect(riskItems.length).toBe(1)
		expect(riskItems[0]).toContain('low completeness score: 4/10')
		expect(mitigationSuggestions.length).toBe(1)
		expect(mitigationSuggestions[0]).toContain('Request clarification')
	})

	test('processes medium completeness score correctly', () => {
		const completenessData: CompletenessEvaluation = {
			score: 6,
			missingInformation: [],
			suggestions: [],
		} as CompletenessEvaluation

		const riskItems: string[] = []
		const mitigationSuggestions: string[] = []

		const score = processCompletenessEvaluation(completenessData, riskItems, mitigationSuggestions)

		expect(score).toBe(2)
		expect(riskItems.length).toBe(0)
		expect(mitigationSuggestions.length).toBe(1)
		expect(mitigationSuggestions[0]).toContain('Document assumptions')
	})

	test('handles missing information correctly', () => {
		const completenessData: CompletenessEvaluation = {
			score: 7,
			missingInformation: ['Missing requirement 1', 'Missing detail 2'],
			suggestions: ['Add more requirements details'],
		} as CompletenessEvaluation

		const riskItems: string[] = []
		const mitigationSuggestions: string[] = []

		const score = processCompletenessEvaluation(completenessData, riskItems, mitigationSuggestions)

		expect(score).toBe(2) // 2 for the two missing items
		expect(riskItems.length).toBe(2)
		expect(riskItems[0]).toContain('Missing information: Missing requirement 1')
		expect(mitigationSuggestions.length).toBe(1)
		expect(mitigationSuggestions[0]).toBe('Add more requirements details')
	})

	test('adds more score for many missing items', () => {
		const completenessData: CompletenessEvaluation = {
			score: 7,
			missingInformation: ['Item 1', 'Item 2', 'Item 3', 'Item 4'],
			suggestions: [],
		} as CompletenessEvaluation

		const riskItems: string[] = []
		const mitigationSuggestions: string[] = []

		const score = processCompletenessEvaluation(completenessData, riskItems, mitigationSuggestions)

		expect(score).toBe(3) // 3 for having more than 2 missing items
		expect(riskItems.length).toBe(3) // Only first 3 items are added
	})

	test('combines score from completeness and missing information', () => {
		const completenessData: CompletenessEvaluation = {
			score: 4,
			missingInformation: ['Item 1', 'Item 2', 'Item 3'],
			suggestions: ['Suggestion 1', 'Suggestion 2', 'Suggestion 3'],
		} as CompletenessEvaluation

		const riskItems: string[] = []
		const mitigationSuggestions: string[] = []

		const score = processCompletenessEvaluation(completenessData, riskItems, mitigationSuggestions)

		expect(score).toBe(6) // 3 for low score + 3 for multiple missing items
		expect(riskItems.length).toBe(4) // 1 for low score + 3 for missing items
		expect(mitigationSuggestions.length).toBe(3) // 1 for low score + 2 from suggestions
	})
})
