/**
 * Status Categories Utility
 *
 * This utility provides functions for determining the category of a Jira status
 * based on common naming patterns. It helps standardize the classification of
 * statuses into common workflow categories like "to do", "in progress", and "done".
 * These categorizations are useful for reporting and analysis across projects
 * that might use different specific status names but follow similar workflow patterns.
 */

/**
 * Checks if a status name contains any of the "done" category keywords
 * @param lowerStatus The lowercase status name
 * @returns True if it matches "done" category
 */
export function isDoneStatus(lowerStatus: string): boolean {
	return lowerStatus.includes('done') || lowerStatus.includes('complete') || lowerStatus.includes('resolved')
}

/**
 * Checks if a status name contains any of the "in progress" category keywords
 * @param lowerStatus The lowercase status name
 * @returns True if it matches "in progress" category
 */
export function isInProgressStatus(lowerStatus: string): boolean {
	return lowerStatus.includes('in progress') || lowerStatus.includes('review') || lowerStatus.includes('dev')
}

/**
 * Checks if a status name contains any of the "to do" category keywords
 * @param lowerStatus The lowercase status name
 * @returns True if it matches "to do" category
 */
export function isToDoStatus(lowerStatus: string): boolean {
	return lowerStatus.includes('to do') || lowerStatus.includes('backlog') || lowerStatus.includes('open')
}

/**
 * Determines the status category for a status name based on keywords
 * @param statusName The status name to categorize
 * @returns The status category or null if not determined
 */
export function determineStatusCategory(statusName: string | null): string | null {
	if (!statusName) {
		return null
	}

	const lowerStatus = statusName.toLowerCase()

	if (isDoneStatus(lowerStatus)) {
		return 'done'
	}

	if (isInProgressStatus(lowerStatus)) {
		return 'indeterminate'
	}

	if (isToDoStatus(lowerStatus)) {
		return 'new'
	}

	return null
}
