/**
 * Checks if a task is taking longer than expected
 * @param inProgressDays Number of days in progress
 * @returns Anomaly message or null if no anomaly
 */
export function checkTaskDuration(inProgressDays: number | null): string | null {
	if (inProgressDays !== null && inProgressDays > 3) {
		return `Task taking longer than expected (${inProgressDays} days)`
	}
	return null
}
