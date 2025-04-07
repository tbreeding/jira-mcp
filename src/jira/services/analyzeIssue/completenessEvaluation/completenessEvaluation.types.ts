/**
 * Result of checking an information category in a Jira issue
 */
export interface CategoryCheckResult {
	missing: string[]
	present: boolean
	quality: 'absent' | 'partial' | 'complete'
}

/**
 * Result of the completeness evaluation component
 */
export interface CompletenessEvaluation {
	score: number
	missingInformation: string[]
	suggestions: string[]
}
