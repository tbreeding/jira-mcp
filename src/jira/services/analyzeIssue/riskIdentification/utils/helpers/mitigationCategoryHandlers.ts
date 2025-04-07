/**
 * Helper functions for handling different categories of mitigation suggestions
 */

import { MITIGATION_SUGGESTIONS } from '../mitigationSuggestions'

/**
 * Checks if a string contains any of the given terms
 */
function containsAny(text: string, terms: string[]): boolean {
	return terms.some(function (term) {
		return text.includes(term)
	})
}

/**
 * Checks for technical risk patterns in the text and adds relevant suggestions
 */
export function addTechnicalRiskSuggestions(riskLower: string, suggestions: Set<string>): void {
	// Technical debt suggestions
	if (containsAny(riskLower, ['technical debt', 'workaround', 'hack', 'temporary', 'refactor'])) {
		suggestions.add(MITIGATION_SUGGESTIONS.technicalDebt)
	}

	// Security suggestions
	if (containsAny(riskLower, ['security', 'auth', 'sensitive', 'data', 'compliance', 'encryption'])) {
		suggestions.add(MITIGATION_SUGGESTIONS.securityIssue)
	}

	// Architecture suggestions
	if (containsAny(riskLower, ['architecture', 'design', 'structure', 'components', 'system-wide'])) {
		suggestions.add(MITIGATION_SUGGESTIONS.architectureImpact)
	}

	// Performance suggestions
	if (containsAny(riskLower, ['performance', 'slow', 'speed', 'optimization', 'latency', 'throughput'])) {
		suggestions.add(MITIGATION_SUGGESTIONS.performanceConcern)
	}
}

/**
 * Checks for testing and knowledge risk patterns in the text and adds relevant suggestions
 */
export function addQualityAndKnowledgeSuggestions(riskLower: string, suggestions: Set<string>): void {
	// Test coverage suggestions
	if (containsAny(riskLower, ['test', 'coverage', 'quality', 'validation'])) {
		suggestions.add(MITIGATION_SUGGESTIONS.testCoverage)
	}

	// Knowledge concentration suggestions
	if (containsAny(riskLower, ['knowledge', 'expertise', 'specialized', 'single developer'])) {
		suggestions.add(MITIGATION_SUGGESTIONS.knowledgeConcentration)
	}
}

/**
 * Checks for timeline and planning risk patterns in the text and adds relevant suggestions
 */
export function addTimelineAndPlanningSuggestions(riskLower: string, suggestions: Set<string>): void {
	// Timeline/estimation suggestions
	if (containsAny(riskLower, ['timeline', 'schedule', 'deadline', 'estimation', 'time'])) {
		suggestions.add(MITIGATION_SUGGESTIONS.timelineRisk)
	}

	// Sprint boundary suggestions
	if (containsAny(riskLower, ['sprint', 'boundary', 'cycle'])) {
		suggestions.add(MITIGATION_SUGGESTIONS.sprintBoundary)
	}
}

/**
 * Checks for dependency risk patterns in the text and adds relevant suggestions
 */
export function addDependencySuggestions(riskLower: string, suggestions: Set<string>): void {
	// Dependency suggestions
	if (containsAny(riskLower, ['dependency', 'dependent', 'blocker', 'blocking', 'waiting'])) {
		suggestions.add(MITIGATION_SUGGESTIONS.blockingDependencies)
	}

	// External dependency suggestions
	if (containsAny(riskLower, ['external', 'team', 'coordination', 'third-party'])) {
		suggestions.add(MITIGATION_SUGGESTIONS.externalDependencies)
	}
}

/**
 * Checks for information risk patterns in the text and adds relevant suggestions
 */
export function addInformationRiskSuggestions(riskLower: string, suggestions: Set<string>): void {
	// Requirements gap suggestions
	if (containsAny(riskLower, ['requirement', 'specification', 'unclear', 'ambiguous', 'missing'])) {
		suggestions.add(MITIGATION_SUGGESTIONS.requirementsGap)
	}
}
