/**
 * Category Weights Configuration for Completeness Scoring
 *
 * This module provides the configuration and initialization of category weights used
 * in the completeness evaluation process. It defines relative importance of different
 * requirement categories such as acceptance criteria, technical constraints, dependencies,
 * testing requirements, design specifications, and user impact. The weights are adjustable
 * based on context, such as increasing design specification importance for frontend tasks.
 */
export interface CategoryWeights {
	acceptanceCriteria: number
	technicalConstraints: number
	dependencies: number
	testingRequirements: number
	designSpecifications: number
	userImpact: number
}

/**
 * Initialize category weights with default values
 */
export function initializeCategoryWeights(isFrontend: boolean): CategoryWeights {
	const weights = {
		acceptanceCriteria: 2, // Highest weight - core agile requirement
		technicalConstraints: 1.5,
		dependencies: 1.5,
		testingRequirements: 1.5,
		designSpecifications: 1, // Base weight, may be increased for frontend issues
		userImpact: 1.5,
	}

	// For frontend-related issues, increase the weight of design specifications
	if (isFrontend) {
		weights.designSpecifications = 2
	}

	return weights
}
