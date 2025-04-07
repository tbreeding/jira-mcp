import {
	processKnowledgeConcentrationIndicators,
	processSpecializedTechnologyIndicators,
} from '../knowledgeTextAnalysisHelpers'
import type { RiskIndicatorResult } from '../../types/riskIdentification.types'

describe('knowledgeTextAnalysisHelpers', () => {
	describe('processKnowledgeConcentrationIndicators', () => {
		test('should return 0 when result.present is false', () => {
			const result = {
				present: false,
				indicators: [],
				severity: 'low',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processKnowledgeConcentrationIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(0)
			expect(riskItems).toHaveLength(0)
			expect(mitigationSuggestions).toHaveLength(0)
		})

		test('should add risk items and return score 3 when severity is high', () => {
			const result = {
				present: true,
				indicators: ['Knowledge:Only one developer knows this component'],
				severity: 'high',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processKnowledgeConcentrationIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(3)
			expect(riskItems).toHaveLength(1)
			expect(riskItems[0]).toBe('Knowledge concentration risk: Only one developer knows this component')
			expect(mitigationSuggestions).toHaveLength(2)
			expect(mitigationSuggestions).toContain('Schedule knowledge sharing sessions; document specialized components')
			expect(mitigationSuggestions).toContain('Consider pair programming for knowledge distribution')
		})

		test('should add risk items and return score 2 when severity is medium', () => {
			const result = {
				present: true,
				indicators: ['Knowledge:Limited knowledge spread for this component'],
				severity: 'medium',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processKnowledgeConcentrationIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(2)
			expect(riskItems).toHaveLength(1)
			expect(riskItems[0]).toBe('Knowledge concentration risk: Limited knowledge spread for this component')
			expect(mitigationSuggestions).toHaveLength(1)
			expect(mitigationSuggestions).toContain('Document specialized knowledge required for this task')
		})

		test('should add risk items and return score 1 when severity is low', () => {
			const result = {
				present: true,
				indicators: ['Knowledge:Some knowledge spread concern'],
				severity: 'low',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processKnowledgeConcentrationIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(1)
			expect(riskItems).toHaveLength(1)
			expect(riskItems[0]).toBe('Knowledge concentration risk: Some knowledge spread concern')
			expect(mitigationSuggestions).toHaveLength(0)
		})

		test('should handle multiple indicators', () => {
			const result = {
				present: true,
				indicators: [
					'Knowledge:Only one developer knows this component',
					'Knowledge:Specialized domain knowledge required',
				],
				severity: 'high',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processKnowledgeConcentrationIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(3)
			expect(riskItems).toHaveLength(2)
			expect(riskItems[0]).toBe('Knowledge concentration risk: Only one developer knows this component')
			expect(riskItems[1]).toBe('Knowledge concentration risk: Specialized domain knowledge required')
			expect(mitigationSuggestions).toHaveLength(2)
		})
	})

	describe('processSpecializedTechnologyIndicators', () => {
		test('should return 0 when result.present is false', () => {
			const result = {
				present: false,
				indicators: [],
				severity: 'low',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processSpecializedTechnologyIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(0)
			expect(riskItems).toHaveLength(0)
			expect(mitigationSuggestions).toHaveLength(0)
		})

		test('should add risk items and return score 3 when severity is high', () => {
			const result = {
				present: true,
				indicators: ['Tech:Requires specialized technology knowledge'],
				severity: 'high',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processSpecializedTechnologyIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(3)
			expect(riskItems).toHaveLength(1)
			expect(riskItems[0]).toBe('Specialized technology risk: Requires specialized technology knowledge')
			expect(mitigationSuggestions).toHaveLength(2)
			expect(mitigationSuggestions).toContain(
				'Identify team members with required specialized skills early in the process',
			)
			expect(mitigationSuggestions).toContain(
				'Allocate time for learning/training if specialized technology is involved',
			)
		})

		test('should add risk items and return score 2 when severity is medium', () => {
			const result = {
				present: true,
				indicators: ['Tech:Uses less common frameworks'],
				severity: 'medium',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processSpecializedTechnologyIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(2)
			expect(riskItems).toHaveLength(1)
			expect(riskItems[0]).toBe('Specialized technology risk: Uses less common frameworks')
			expect(mitigationSuggestions).toHaveLength(1)
			expect(mitigationSuggestions).toContain('Create documentation for specialized technologies used')
		})

		test('should add risk items and return score 1 when severity is low', () => {
			const result = {
				present: true,
				indicators: ['Tech:Some technology expertise required'],
				severity: 'low',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processSpecializedTechnologyIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(1)
			expect(riskItems).toHaveLength(1)
			expect(riskItems[0]).toBe('Specialized technology risk: Some technology expertise required')
			expect(mitigationSuggestions).toHaveLength(0)
		})

		test('should handle multiple indicators', () => {
			const result = {
				present: true,
				indicators: ['Tech:Requires specialized technology knowledge', 'Tech:Uses external proprietary system'],
				severity: 'high',
			} as unknown as RiskIndicatorResult

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = processSpecializedTechnologyIndicators(result, riskItems, mitigationSuggestions)

			expect(score).toBe(3)
			expect(riskItems).toHaveLength(2)
			expect(riskItems[0]).toBe('Specialized technology risk: Requires specialized technology knowledge')
			expect(riskItems[1]).toBe('Specialized technology risk: Uses external proprietary system')
			expect(mitigationSuggestions).toHaveLength(2)
		})
	})
})
