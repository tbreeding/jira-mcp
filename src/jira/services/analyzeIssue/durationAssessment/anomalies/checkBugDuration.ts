/**
 * Checks if a bug is taking longer than expected
 * @param inProgressDays Number of days in progress
 * @returns Anomaly message or null if no anomaly
 */
export function checkBugDuration(inProgressDays: number | null): string | null {
	if (inProgressDays !== null && inProgressDays > 5) {
		return `Bug fix taking longer than expected (${inProgressDays} days)`
	}
	return null
}
