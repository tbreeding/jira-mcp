/**
 * This file analyzes field modifications in Jira issues to assess complexity.
 * It tracks the number of changes made to issue fields and the variety of fields modified.
 * Frequent modifications across many different fields typically indicate a complex issue
 * that required significant adjustments throughout its lifecycle. This analysis helps
 * identify issues that may have had unclear requirements or shifting priorities.
 */
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Counts field modifications and collects unique fields
 */
function countFieldModifications(issue: JiraIssue): { modificationCount: number; uniqueFields: Set<string> } {
	let modificationCount = 0
	const uniqueFields = new Set<string>()

	if (issue.changelog && issue.changelog.histories) {
		issue.changelog.histories.forEach(function (history) {
			history.items.forEach(function (item) {
				modificationCount++
				uniqueFields.add(item.field)
			})
		})
	}

	return { modificationCount, uniqueFields }
}

/**
 * Calculates complexity score based on modifications
 */
function calculateModificationScore(modificationCount: number, uniqueFieldsCount: number): number {
	if (modificationCount > 15 || uniqueFieldsCount > 8) {
		return 3
	}

	if (modificationCount > 8 || uniqueFieldsCount > 4) {
		return 2
	}

	if (modificationCount > 0) {
		return 1
	}

	return 0
}

/**
 * Creates a descriptive factor about field modifications
 */
function createModificationFactor(modificationCount: number, uniqueFieldsCount: number): string | null {
	if (modificationCount === 0) {
		return null
	}

	return `Field modifications: ${modificationCount} changes across ${uniqueFieldsCount} different fields`
}

/**
 * Analyzes the frequency of field modifications
 *
 * @param issue - The Jira issue to analyze
 * @returns Score and factor describing complexity from field modifications
 */
export function analyzeFieldModifications(issue: JiraIssue): { score: number; factor: string | null } {
	const { modificationCount, uniqueFields } = countFieldModifications(issue)

	const score = calculateModificationScore(modificationCount, uniqueFields.size)
	const factor = createModificationFactor(modificationCount, uniqueFields.size)

	return { score, factor }
}
