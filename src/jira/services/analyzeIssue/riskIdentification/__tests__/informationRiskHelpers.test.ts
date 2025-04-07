/**
 * Tests for information risk helper functions
 */

import {
	processRequirementsGapIndicators,
	processAmbiguityIndicators,
	checkForMissingDescription,
} from '../helpers/informationRiskHelpers'
import type { RiskIndicatorResult } from '../types/riskIdentification.types'

describe('Information Risk Helpers', () => {
	describe('processRequirementsGapIndicators', () => {
		test('returns 0 if no indicators present', () => {
			const result: RiskIndicatorResult = {
				present: false,
				indicators: [],
				severity: 'low',
			}
			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processRequirementsGapIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(0)
			expect(riskItems.length).toBe(0)
			expect(mitigationSuggestions.length).toBe(0)
		})

		test('processes high severity requirements gaps correctly', () => {
			const result: RiskIndicatorResult = {
				present: true,
				indicators: ['Requirements Gap Risk: missing requirement found in text'],
				severity: 'high',
			}
			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processRequirementsGapIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(3)
			expect(riskItems.length).toBe(1)
			expect(riskItems[0]).toContain('Requirements gap:')
			expect(mitigationSuggestions.length).toBe(1)
			expect(mitigationSuggestions[0]).toContain('clarification')
		})

		test('processes medium severity requirements gaps correctly', () => {
			const result: RiskIndicatorResult = {
				present: true,
				indicators: ['Requirements Gap Risk: missing requirement found in text'],
				severity: 'medium',
			}
			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processRequirementsGapIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(2)
			expect(mitigationSuggestions[0]).toContain('Document open questions')
		})

		test('processes low severity requirements gaps correctly', () => {
			const result: RiskIndicatorResult = {
				present: true,
				indicators: ['Requirements Gap Risk: minor requirement issue found in text'],
				severity: 'low',
			}
			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processRequirementsGapIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(1)
			expect(riskItems.length).toBe(1)
			expect(riskItems[0]).toContain('Requirements gap:')
			expect(mitigationSuggestions.length).toBe(0) // No suggestions for low severity
		})
	})

	describe('processAmbiguityIndicators', () => {
		test('returns 0 if no indicators present', () => {
			const result: RiskIndicatorResult = {
				present: false,
				indicators: [],
				severity: 'low',
			}
			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processAmbiguityIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(0)
			expect(riskItems.length).toBe(0)
			expect(mitigationSuggestions.length).toBe(0)
		})

		test('processes high severity ambiguity correctly', () => {
			const result: RiskIndicatorResult = {
				present: true,
				indicators: ['Ambiguity Risk: ambiguity found in text'],
				severity: 'high',
			}
			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processAmbiguityIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(3)
			expect(riskItems.length).toBe(1)
			expect(riskItems[0]).toContain('Ambiguity issue:')
			expect(mitigationSuggestions.length).toBe(1)
			expect(mitigationSuggestions[0]).toContain('Document assumptions')
		})

		test('processes medium severity ambiguity correctly', () => {
			const result: RiskIndicatorResult = {
				present: true,
				indicators: ['Ambiguity Risk: ambiguity found in text'],
				severity: 'medium',
			}
			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processAmbiguityIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(2)
			expect(mitigationSuggestions[0]).toContain('Identify and document all assumptions')
		})

		test('processes low severity ambiguity correctly', () => {
			const result: RiskIndicatorResult = {
				present: true,
				indicators: ['Ambiguity Risk: minor ambiguity found in text'],
				severity: 'low',
			}
			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processAmbiguityIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(1)
			expect(riskItems.length).toBe(1)
			expect(riskItems[0]).toContain('Ambiguity issue:')
			expect(mitigationSuggestions.length).toBe(0) // No suggestions for low severity
		})
	})

	describe('checkForMissingDescription', () => {
		test('returns 0 if description exists', () => {
			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = checkForMissingDescription('Valid description', riskItems, mitigationSuggestions)

			expect(score).toBe(0)
			expect(riskItems.length).toBe(0)
			expect(mitigationSuggestions.length).toBe(0)
		})

		test('returns 3 and adds risk item if description is missing', () => {
			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = checkForMissingDescription('', riskItems, mitigationSuggestions)

			expect(score).toBe(3)
			expect(riskItems.length).toBe(1)
			expect(riskItems[0]).toBe('Issue has no description')
			expect(mitigationSuggestions.length).toBe(1)
			expect(mitigationSuggestions[0]).toContain('Request complete description')
		})

		test('returns 3 and adds risk item if description is only whitespace', () => {
			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = checkForMissingDescription('  \t\n  ', riskItems, mitigationSuggestions)

			expect(score).toBe(3)
			expect(riskItems.length).toBe(1)
		})

		test('returns 3 and adds risk item if description is null', () => {
			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = checkForMissingDescription(null, riskItems, mitigationSuggestions)

			expect(score).toBe(3)
			expect(riskItems.length).toBe(1)
			expect(riskItems[0]).toBe('Issue has no description')
			expect(mitigationSuggestions.length).toBe(1)
		})

		test('returns 3 and adds risk item if description is undefined', () => {
			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = checkForMissingDescription(undefined, riskItems, mitigationSuggestions)

			expect(score).toBe(3)
			expect(riskItems.length).toBe(1)
			expect(riskItems[0]).toBe('Issue has no description')
			expect(mitigationSuggestions.length).toBe(1)
		})
	})
})
