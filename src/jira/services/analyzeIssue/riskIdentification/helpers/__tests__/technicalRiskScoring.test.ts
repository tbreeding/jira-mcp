import { calculateTechnicalRiskScore } from '../technicalRiskScoring'
import type { RiskIndicatorResult } from '../../types/riskIdentification.types'

describe('technicalRiskScoring', () => {
	describe('calculateTechnicalRiskScore', () => {
		// Test helper to create a default RiskIndicatorResult
		function createRiskResult(present = false, severity: 'low' | 'medium' | 'high' = 'low'): RiskIndicatorResult {
			return {
				present,
				indicators: present ? ['Test indicator'] : [],
				severity,
			} as unknown as RiskIndicatorResult
		}

		test('returns baseline score of 1 when no risks are present', () => {
			const technicalDebtResult = createRiskResult(false)
			const architectureResult = createRiskResult(false)
			const performanceResult = createRiskResult(false)
			const securityResult = createRiskResult(false)

			const score = calculateTechnicalRiskScore(
				technicalDebtResult,
				architectureResult,
				performanceResult,
				securityResult,
			)

			expect(score).toBe(1)
		})

		test('adds 2.25 points for high severity technical debt', () => {
			const technicalDebtResult = createRiskResult(true, 'high')
			const architectureResult = createRiskResult(false)
			const performanceResult = createRiskResult(false)
			const securityResult = createRiskResult(false)

			const score = calculateTechnicalRiskScore(
				technicalDebtResult,
				architectureResult,
				performanceResult,
				securityResult,
			)

			expect(score).toBe(3) // 1 (base) + 2.25 = 3.25, rounded to 3
		})

		test('adds 1.5 points for medium severity technical debt', () => {
			const technicalDebtResult = createRiskResult(true, 'medium')
			const architectureResult = createRiskResult(false)
			const performanceResult = createRiskResult(false)
			const securityResult = createRiskResult(false)

			const score = calculateTechnicalRiskScore(
				technicalDebtResult,
				architectureResult,
				performanceResult,
				securityResult,
			)

			expect(score).toBe(3) // 1 (base) + 1.5 = 2.5, rounded to 3
		})

		test('adds 0.75 points for low severity technical debt', () => {
			const technicalDebtResult = createRiskResult(true, 'low')
			const architectureResult = createRiskResult(false)
			const performanceResult = createRiskResult(false)
			const securityResult = createRiskResult(false)

			const score = calculateTechnicalRiskScore(
				technicalDebtResult,
				architectureResult,
				performanceResult,
				securityResult,
			)

			expect(score).toBe(2) // 1 (base) + 0.75 = 1.75, rounded to 2
		})

		test('adds 2.25 points for high severity architecture risk', () => {
			const technicalDebtResult = createRiskResult(false)
			const architectureResult = createRiskResult(true, 'high')
			const performanceResult = createRiskResult(false)
			const securityResult = createRiskResult(false)

			const score = calculateTechnicalRiskScore(
				technicalDebtResult,
				architectureResult,
				performanceResult,
				securityResult,
			)

			expect(score).toBe(3) // 1 (base) + 2.25 = 3.25, rounded to 3
		})

		test('adds 1.5 points for medium severity architecture risk', () => {
			const technicalDebtResult = createRiskResult(false)
			const architectureResult = createRiskResult(true, 'medium')
			const performanceResult = createRiskResult(false)
			const securityResult = createRiskResult(false)

			const score = calculateTechnicalRiskScore(
				technicalDebtResult,
				architectureResult,
				performanceResult,
				securityResult,
			)

			expect(score).toBe(3) // 1 (base) + 1.5 = 2.5, rounded to 3
		})

		test('adds 0.75 points for low severity architecture risk', () => {
			const technicalDebtResult = createRiskResult(false)
			const architectureResult = createRiskResult(true, 'low')
			const performanceResult = createRiskResult(false)
			const securityResult = createRiskResult(false)

			const score = calculateTechnicalRiskScore(
				technicalDebtResult,
				architectureResult,
				performanceResult,
				securityResult,
			)

			expect(score).toBe(2) // 1 (base) + 0.75 = 1.75, rounded to 2
		})

		test('adds 2.25 points for high severity performance risk', () => {
			const technicalDebtResult = createRiskResult(false)
			const architectureResult = createRiskResult(false)
			const performanceResult = createRiskResult(true, 'high')
			const securityResult = createRiskResult(false)

			const score = calculateTechnicalRiskScore(
				technicalDebtResult,
				architectureResult,
				performanceResult,
				securityResult,
			)

			expect(score).toBe(3) // 1 (base) + 2.25 = 3.25, rounded to 3
		})

		test('adds 1.5 points for medium severity performance risk', () => {
			const technicalDebtResult = createRiskResult(false)
			const architectureResult = createRiskResult(false)
			const performanceResult = createRiskResult(true, 'medium')
			const securityResult = createRiskResult(false)

			const score = calculateTechnicalRiskScore(
				technicalDebtResult,
				architectureResult,
				performanceResult,
				securityResult,
			)

			expect(score).toBe(3) // 1 (base) + 1.5 = 2.5, rounded to 3
		})

		test('adds 0.75a points for low severity performance risk', () => {
			const technicalDebtResult = createRiskResult(false)
			const architectureResult = createRiskResult(false)
			const performanceResult = createRiskResult(true, 'low')
			const securityResult = createRiskResult(false)

			const score = calculateTechnicalRiskScore(
				technicalDebtResult,
				architectureResult,
				performanceResult,
				securityResult,
			)

			expect(score).toBe(2) // 1 (base) + 0.75 = 1.75, rounded to 2
		})

		test('adds 2.25 points for high severity security risk', () => {
			const technicalDebtResult = createRiskResult(false)
			const architectureResult = createRiskResult(false)
			const performanceResult = createRiskResult(false)
			const securityResult = createRiskResult(true, 'high')

			const score = calculateTechnicalRiskScore(
				technicalDebtResult,
				architectureResult,
				performanceResult,
				securityResult,
			)

			expect(score).toBe(3) // 1 (base) + 2.25 = 3.25, rounded to 3
		})

		test('adds 1.5 points for medium severity security risk', () => {
			const technicalDebtResult = createRiskResult(false)
			const architectureResult = createRiskResult(false)
			const performanceResult = createRiskResult(false)
			const securityResult = createRiskResult(true, 'medium')

			const score = calculateTechnicalRiskScore(
				technicalDebtResult,
				architectureResult,
				performanceResult,
				securityResult,
			)

			expect(score).toBe(3) // 1 (base) + 1.5 = 2.5, rounded to 3
		})

		test('adds 0.75 points for low severity security risk', () => {
			const technicalDebtResult = createRiskResult(false)
			const architectureResult = createRiskResult(false)
			const performanceResult = createRiskResult(false)
			const securityResult = createRiskResult(true, 'low')

			const score = calculateTechnicalRiskScore(
				technicalDebtResult,
				architectureResult,
				performanceResult,
				securityResult,
			)

			expect(score).toBe(2) // 1 (base) + 0.75 = 1.75, rounded to 2
		})

		test('combines scores from multiple risk categories', () => {
			const technicalDebtResult = createRiskResult(true, 'high')
			const architectureResult = createRiskResult(true, 'medium')
			const performanceResult = createRiskResult(true, 'low')
			const securityResult = createRiskResult(true, 'high')

			const score = calculateTechnicalRiskScore(
				technicalDebtResult,
				architectureResult,
				performanceResult,
				securityResult,
			)

			// 1 (base) + 2.25 + 1.5 + 0.75 + 2.25 = 7.75, rounded to 8
			expect(score).toBe(8)
		})

		test('caps score at 10', () => {
			// This scenario would yield a score above 10 if not capped
			const highRisk = createRiskResult(true, 'high')

			const score = calculateTechnicalRiskScore(highRisk, highRisk, highRisk, highRisk)

			// 1 (base) + 2.25 + 2.25 + 2.25 + 2.25 = 10, capped at 10
			expect(score).toBe(10)
		})
	})
})
