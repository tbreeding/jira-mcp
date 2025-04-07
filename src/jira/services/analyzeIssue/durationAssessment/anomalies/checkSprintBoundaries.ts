/**
 * Checks for sprint boundary crossing issues
 * @param sprintReassignments Number of sprint reassignments
 * @returns Anomaly message or null if no anomaly
 */
export function checkSprintBoundaries(sprintReassignments: number): string | null {
	if (sprintReassignments > 0) {
		return `Issue reassigned across sprints ${sprintReassignments} times`
	}
	return null
}
