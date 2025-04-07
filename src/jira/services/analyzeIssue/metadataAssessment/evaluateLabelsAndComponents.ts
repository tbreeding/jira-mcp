/**
 * Labels and Components Evaluator
 *
 * This module assesses the completeness of labels and components assigned to Jira issues.
 * It verifies that issues are properly categorized according to organizational standards,
 * checking for required label categories like technical area and work type. The analysis
 * helps ensure consistent issue categorization, which is essential for filtering, reporting,
 * and team coordination. Well-labeled issues facilitate workflow automation, dashboards,
 * and visibility of work distribution across different areas of responsibility.
 */
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Evaluates if labeling and component categorization is appropriate
 */
export function evaluateLabelsAndComponents(issue: JiraIssue): boolean {
	const labels = issue.fields.labels || []
	const components = issue.fields.components || []

	// Check if any labels or components exist
	if (labels.length === 0 && components.length === 0) {
		return false // Neither labels nor components are specified
	}

	// Check for project-specific required labels (example)
	const requiredLabelCategories = [
		['frontend', 'backend', 'api', 'database', 'infrastructure'], // Tech area
		['feature', 'bugfix', 'refactor', 'documentation'], // Work type
	]

	// Simplified check - in a real implementation, you'd validate against your specific labeling conventions
	const hasRequiredLabels = requiredLabelCategories.every((category) =>
		category.some((label) => labels.includes(label)),
	)

	return hasRequiredLabels || components.length > 0
}
