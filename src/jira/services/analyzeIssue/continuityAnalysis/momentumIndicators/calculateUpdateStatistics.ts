/**
 * Calculates statistical measures of update consistency
 *
 * @param updateGaps - Array of time gaps between updates in days
 * @param updates - Array of update timestamps
 * @param totalDurationDays - Total duration of the issue in days
 * @returns Object containing coefficient of variation and updates per day
 */
export function calculateUpdateStatistics(
	updateGaps: number[],
	updates: number[],
	totalDurationDays: number,
): {
	coeffOfVariation: number
	updatesPerDay: number
} {
	// Calculate coefficient of variation (std dev / mean) to measure consistency
	// Lower coefficient = more consistent updates
	const meanGap = updateGaps.reduce((sum, gap) => sum + gap, 0) / updateGaps.length
	const variance = updateGaps.reduce((sum, gap) => sum + Math.pow(gap - meanGap, 2), 0) / updateGaps.length
	const stdDev = Math.sqrt(variance)
	const coeffOfVariation = meanGap > 0 ? stdDev / meanGap : 0

	// Calculate update frequency (updates per day)
	const updatesPerDay = updates.length / totalDurationDays

	return { coeffOfVariation, updatesPerDay }
}
