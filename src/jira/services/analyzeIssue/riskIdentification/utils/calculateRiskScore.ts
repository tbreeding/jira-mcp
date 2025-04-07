/**
 * Utility for calculating risk scores
 *
 * This file provides functionality to calculate the overall risk score
 * based on individual risk category scores. It applies appropriate
 * weights to each risk category according to their relative importance.
 */

import { DEFAULT_RISK_WEIGHTS, type RiskCategoryWeights } from '../types/riskIdentification.types'

/**
 * Calculates a weighted risk score from individual category scores
 *
 * @param technicalScore - Score for technical risk (1-10)
 * @param dependencyScore - Score for dependency risk (1-10)
 * @param timelineScore - Score for timeline risk (1-10)
 * @param knowledgeScore - Score for knowledge concentration risk (1-10)
 * @param informationScore - Score for information risk (1-10)
 * @param weights - Optional custom weights for each category
 * @returns Normalized risk score on a scale of 1-10
 */
export function calculateRiskScore(
	technicalScore: number,
	dependencyScore: number,
	timelineScore: number,
	knowledgeScore: number,
	informationScore: number,
	weights: RiskCategoryWeights = DEFAULT_RISK_WEIGHTS,
): number {
	// Ensure all scores are within valid range
	const validTechnicalScore = normalizeInput(technicalScore)
	const validDependencyScore = normalizeInput(dependencyScore)
	const validTimelineScore = normalizeInput(timelineScore)
	const validKnowledgeScore = normalizeInput(knowledgeScore)
	const validInformationScore = normalizeInput(informationScore)

	// Ensure weights add up to 1
	const normalizedWeights = normalizeWeights(weights)

	// Calculate weighted score
	const weightedScore =
		validTechnicalScore * normalizedWeights.technical +
		validDependencyScore * normalizedWeights.dependency +
		validTimelineScore * normalizedWeights.timeline +
		validKnowledgeScore * normalizedWeights.knowledge +
		validInformationScore * normalizedWeights.information

	// Return rounded score
	return Math.round(weightedScore)
}

/**
 * Ensures a score is within the valid 1-10 range
 */
function normalizeInput(score: number): number {
	return Math.max(1, Math.min(10, score))
}

/**
 * Ensures weights add up to 1 to maintain scale
 */
function normalizeWeights(weights: RiskCategoryWeights): RiskCategoryWeights {
	const totalWeight =
		weights.technical + weights.dependency + weights.timeline + weights.knowledge + weights.information

	// If weights already sum to 1 (or very close), return as is
	if (Math.abs(totalWeight - 1) < 0.001) {
		return weights
	}

	// Otherwise normalize
	return {
		technical: weights.technical / totalWeight,
		dependency: weights.dependency / totalWeight,
		timeline: weights.timeline / totalWeight,
		knowledge: weights.knowledge / totalWeight,
		information: weights.information / totalWeight,
	}
}
