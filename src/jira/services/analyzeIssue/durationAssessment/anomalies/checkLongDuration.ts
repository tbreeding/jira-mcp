/**
 * Checks if the issue has spent too long in progress
 * @param inProgressDays Number of days in progress
 * @returns Anomaly message or null if no anomaly
 */
export function checkLongDuration(inProgressDays: number | null): string | null {
	if (inProgressDays !== null && inProgressDays > 10) {
		return `Long in-progress duration (${inProgressDays} business days)`
	}
	return null
}
