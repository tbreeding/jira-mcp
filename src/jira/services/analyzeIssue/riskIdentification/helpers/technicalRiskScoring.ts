/**
 * Helper functions for scoring technical risks in Jira issues
 *
 * These functions calculate risk scores based on detected risk indicators
 */

import type { RiskIndicatorResult } from '../types/riskIdentification.types'

/**
 * Calculates a risk score based on detected risk indicators
 *
 * @param technicalDebtResult - Results from technical debt analysis
 * @param architectureResult - Results from architecture impact analysis
 * @param performanceResult - Results from performance concern analysis
 * @param securityResult - Results from security risk analysis
 * @returns Risk score (1-10)
 */
export function calculateTechnicalRiskScore(
	technicalDebtResult: RiskIndicatorResult,
	architectureResult: RiskIndicatorResult,
	performanceResult: RiskIndicatorResult,
	securityResult: RiskIndicatorResult,
): number {
	// Base score starts at 1, each risk category can add up to 2.25 points
	let score = 1

	if (technicalDebtResult.present) {
		score += technicalDebtResult.severity === 'high' ? 2.25 : technicalDebtResult.severity === 'medium' ? 1.5 : 0.75
	}

	if (architectureResult.present) {
		score += architectureResult.severity === 'high' ? 2.25 : architectureResult.severity === 'medium' ? 1.5 : 0.75
	}

	if (performanceResult.present) {
		score += performanceResult.severity === 'high' ? 2.25 : performanceResult.severity === 'medium' ? 1.5 : 0.75
	}

	if (securityResult.present) {
		score += securityResult.severity === 'high' ? 2.25 : securityResult.severity === 'medium' ? 1.5 : 0.75
	}

	// Ensure score is within 1-10 range
	return Math.min(10, Math.max(1, Math.round(score)))
}
