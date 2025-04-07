/**
 * Determines if a given status represents active work
 * Active statuses are typically those in the "In Progress" category
 * but not in blocked or waiting states
 *
 * @param statusName - The name of the status to check
 * @returns True if the status represents active work, false otherwise
 */
export function isActiveStatus(statusName: string): boolean {
	// Convert status name to lowercase for case-insensitive comparison
	const status = statusName.toLowerCase()

	// Statuses that indicate active work
	const activeKeywords = ['progress', 'developing', 'implementing', 'coding', 'working', 'active']

	// Statuses that indicate blocked or waiting states (not active)
	const inactiveKeywords = [
		'blocked',
		'waiting',
		'on hold',
		'pending',
		'review',
		'testing',
		'qa',
		'done',
		'resolved',
		'closed',
	]

	// Check if status contains active keywords and doesn't contain inactive keywords
	const isActive =
		activeKeywords.some((keyword) => status.includes(keyword)) &&
		!inactiveKeywords.some((keyword) => status.includes(keyword))

	return isActive
}
