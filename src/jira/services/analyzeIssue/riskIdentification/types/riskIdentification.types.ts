/**
 * Type definitions for the Risk Identification component
 *
 * This file contains types and interfaces related to risk identification,
 * including the structure of risk analysis results, risk categories,
 * and supporting types for risk analysis.
 */

import type { CompletenessEvaluation } from '../../completenessEvaluation/completenessEvaluation.types'
import type { ContinuityAnalysisResult } from '../../continuityAnalysis/types/continuityAnalysis.types'
import type { Dependencies } from '../../dependenciesAnalysis/types/dependencies.types'
import type { DurationAssessment } from '../../durationAssessment/types/durationAssessment.types'

// Complexity type extracted from getComplexityAnalysis return type
interface ComplexityAnalysisResult {
	score: number
	factors: string[]
	level: 'trivial' | 'simple' | 'moderate' | 'complex' | 'very complex'
}

/**
 * Risk identification result returned by the main analysis function
 */
export interface RiskIdentification {
	score: number // 1-10 scale
	items: string[]
	mitigationSuggestions: string[]
}

/**
 * Previous analysis results that can be used to enhance risk identification
 */
export interface PreviousAnalysisResults {
	complexity?: ComplexityAnalysisResult
	dependencies?: Dependencies
	duration?: DurationAssessment
	completeness?: CompletenessEvaluation
	continuity?: ContinuityAnalysisResult
}

/**
 * Risk category evaluation result
 */
export interface RiskCategoryResult {
	score: number // 1-10 scale for the category
	riskItems: string[] // Identified risks in this category
	mitigationSuggestions: string[] // Suggestions specific to this category
}

/**
 * Risk category weights for score calculation
 */
export interface RiskCategoryWeights {
	technical: number
	dependency: number
	timeline: number
	knowledge: number
	information: number
}

/**
 * Default weights for risk categories
 */
export const DEFAULT_RISK_WEIGHTS: RiskCategoryWeights = {
	technical: 0.25,
	dependency: 0.2,
	timeline: 0.2,
	knowledge: 0.15,
	information: 0.2,
}

/**
 * Result of detecting risk indicators in text
 */
export interface RiskIndicatorResult {
	present: boolean
	indicators: string[]
	severity: 'low' | 'medium' | 'high'
}
