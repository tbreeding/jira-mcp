/**
 * Checks for issues with velocity
 * @param pointToDurationRatio Story points to duration ratio
 * @returns Array of anomaly messages
 */
export function checkVelocityIssues(pointToDurationRatio: number | null): string[] {
	const anomalies: string[] = []

	if (pointToDurationRatio !== null) {
		// Lower than expected velocity
		if (pointToDurationRatio < 0.5) {
			anomalies.push(`Low velocity (${pointToDurationRatio} points per day)`)
		}
		// Higher than expected velocity (potential underestimation)
		if (pointToDurationRatio > 3) {
			anomalies.push(`High velocity (${pointToDurationRatio} points per day, potential underestimation)`)
		}
	}

	return anomalies
}
