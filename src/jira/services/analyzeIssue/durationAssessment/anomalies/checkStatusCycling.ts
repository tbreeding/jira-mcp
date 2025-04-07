/**
 * Checks for excessive status cycling
 * @param statusCyclingTotal Total number of status revisits
 * @returns Anomaly message or null if no anomaly
 */
export function checkStatusCycling(statusCyclingTotal: number): string | null {
	if (statusCyclingTotal > 3) {
		return `Excessive status cycling (${statusCyclingTotal} status revisits)`
	}
	return null
}
