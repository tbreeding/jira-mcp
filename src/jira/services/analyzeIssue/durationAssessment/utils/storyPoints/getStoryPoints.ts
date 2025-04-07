/**
 * Story Points Extractor
 *
 * This utility retrieves story point values from Jira issues, handling the complexity of
 * different field names and data structures across various Jira configurations.
 * It implements a prioritized search across multiple potential story point fields,
 * ensuring consistent extraction regardless of where the data is stored. The module
 * provides robust fallback mechanisms to handle different Jira setups and customizations,
 * making it reliable for estimating issue complexity across different projects and teams.
 */
import { extractNumericValue } from './extractNumericValue'
import { STORY_POINT_FIELD, OTHER_STORY_POINT_FIELDS } from './storyPointFields'
import type { JiraIssue } from '../../../../../types/issue.types'

/**
 * Get story point value from custom field
 * @param issue The Jira issue
 * @returns Story point value or null if not found
 */
export function getStoryPoints(issue: JiraIssue): number | null {
	// First check the prioritized field
	const storyPoints = extractNumericValue(issue.fields[STORY_POINT_FIELD])
	if (storyPoints !== null) {
		return storyPoints
	}

	// Then try each of the other possible fields
	for (const fieldName of OTHER_STORY_POINT_FIELDS) {
		const field = issue.fields[fieldName as keyof typeof issue.fields]
		const value = extractNumericValue(field)
		if (value !== null) {
			return value
		}
	}

	return null
}
