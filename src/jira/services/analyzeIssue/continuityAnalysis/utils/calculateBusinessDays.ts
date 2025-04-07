/**
 * Calculates the number of business days (Monday to Friday) between two dates
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns The number of business days between the two dates
 */
export function calculateBusinessDays(startDate: string, endDate: string): number {
	const start = new Date(startDate)
	const end = new Date(endDate)

	// Set hours to beginning of day
	start.setHours(0, 0, 0, 0)
	end.setHours(0, 0, 0, 0)

	// Initial count of days between dates
	let count = 0
	const currentDate = new Date(start)

	// Loop through each day
	while (currentDate <= end) {
		// Check if current day is a weekday (Monday-Friday: 1-5)
		const dayOfWeek = currentDate.getDay()
		if (dayOfWeek !== 0 && dayOfWeek !== 6) {
			count++
		}

		// Move to next day
		currentDate.setDate(currentDate.getDate() + 1)
	}

	return count
}
