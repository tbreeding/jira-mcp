/**
 * Tests for timeline text analysis helper functions
 */

import {
	processTimelineConstraintIndicators,
	processEstimationConcernIndicators,
} from '../helpers/timelineTextAnalysisHelpers'
import type { RiskIndicatorResult } from '../types/riskIdentification.types'

describe('timelineTextAnalysisHelpers', () => {
	describe('processTimelineConstraintIndicators', () => {
		test('should return 0 when result.present is false', () => {
			const result = {
				present: false,
				indicators: [],
				severity: 'low',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processTimelineConstraintIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(0)
			expect(riskItems).toHaveLength(0)
			expect(mitigationSuggestions).toHaveLength(0)
		})

		test('should add risk items and return score 3 when severity is high', () => {
			const result = {
				present: true,
				indicators: ['Timeline:Tight deadline imposed by external constraints'],
				severity: 'high',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processTimelineConstraintIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(3)
			expect(riskItems).toHaveLength(1)
			expect(riskItems[0]).toBe('Timeline constraint: Tight deadline imposed by external constraints')
			expect(mitigationSuggestions).toHaveLength(2)
			expect(mitigationSuggestions).toContain('Consider breaking issue into smaller, more manageable sub-tasks')
			expect(mitigationSuggestions).toContain('Identify critical path tasks and prioritize accordingly')
		})

		test('should add risk items and return score 2 when severity is medium', () => {
			const result = {
				present: true,
				indicators: ['Timeline:Moderate timeline pressure'],
				severity: 'medium',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processTimelineConstraintIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(2)
			expect(riskItems).toHaveLength(1)
			expect(riskItems[0]).toBe('Timeline constraint: Moderate timeline pressure')
			expect(mitigationSuggestions).toHaveLength(1)
			expect(mitigationSuggestions).toContain('Create detailed timeline with key milestones and dependencies')
		})

		test('should add risk items and return score 1 when severity is low', () => {
			const result = {
				present: true,
				indicators: ['Timeline:Minor timeline concern'],
				severity: 'low',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processTimelineConstraintIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(1)
			expect(riskItems).toHaveLength(1)
			expect(riskItems[0]).toBe('Timeline constraint: Minor timeline concern')
			expect(mitigationSuggestions).toHaveLength(0)
		})

		test('should handle multiple indicators', () => {
			const result = {
				present: true,
				indicators: [
					'Timeline:Tight deadline imposed by external constraints',
					'Timeline:Multiple dependencies affecting schedule',
				],
				severity: 'high',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processTimelineConstraintIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(3)
			expect(riskItems).toHaveLength(2)
			expect(riskItems[0]).toBe('Timeline constraint: Tight deadline imposed by external constraints')
			expect(riskItems[1]).toBe('Timeline constraint: Multiple dependencies affecting schedule')
		})
	})

	describe('processEstimationConcernIndicators', () => {
		test('should return 0 when result.present is false', () => {
			const result = {
				present: false,
				indicators: [],
				severity: 'low',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processEstimationConcernIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(0)
			expect(riskItems).toHaveLength(0)
			expect(mitigationSuggestions).toHaveLength(0)
		})

		test('should add risk items and return score 3 when severity is high', () => {
			const result = {
				present: true,
				indicators: ['Estimation:Significant uncertainty in estimation'],
				severity: 'high',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processEstimationConcernIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(3)
			expect(riskItems).toHaveLength(1)
			expect(riskItems[0]).toBe('Estimation concern: Significant uncertainty in estimation')
			expect(mitigationSuggestions).toHaveLength(1)
			expect(mitigationSuggestions).toContain('Review and possibly adjust story point estimation before committing')
		})

		test('should add risk items and return score 2 when severity is medium', () => {
			const result = {
				present: true,
				indicators: ['Estimation:Some uncertainty in scope'],
				severity: 'medium',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processEstimationConcernIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(2)
			expect(riskItems).toHaveLength(1)
			expect(riskItems[0]).toBe('Estimation concern: Some uncertainty in scope')
			expect(mitigationSuggestions).toHaveLength(1)
			expect(mitigationSuggestions).toContain('Consider re-estimation with team input')
		})

		test('should add risk items and return score 1 when severity is low', () => {
			const result = {
				present: true,
				indicators: ['Estimation:Minor estimation question'],
				severity: 'low',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processEstimationConcernIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(1)
			expect(riskItems).toHaveLength(1)
			expect(riskItems[0]).toBe('Estimation concern: Minor estimation question')
			expect(mitigationSuggestions).toHaveLength(0)
		})

		test('should handle multiple indicators', () => {
			const result = {
				present: true,
				indicators: [
					'Estimation:Significant uncertainty in estimation',
					'Estimation:Unclear requirements affecting estimation',
				],
				severity: 'high',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processEstimationConcernIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(3)
			expect(riskItems).toHaveLength(2)
			expect(riskItems[0]).toBe('Estimation concern: Significant uncertainty in estimation')
			expect(riskItems[1]).toBe('Estimation concern: Unclear requirements affecting estimation')
		})
	})
})
