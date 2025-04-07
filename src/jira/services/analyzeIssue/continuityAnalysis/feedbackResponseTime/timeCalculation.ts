/**
 * Adjusts the response time to account for business hours only
 *
 * @param questionTime - The timestamp of the question
 * @param responseTime - The timestamp of the response
 * @returns The adjusted response time in business hours
 */
export function adjustForBusinessHours(questionTime: number, responseTime: number): number {
	const totalHours = (responseTime - questionTime) / (1000 * 60 * 60)

	// Simple approximation: Assume 8 business hours per day (Monday-Friday)
	// This is a simplified calculation - a real implementation would be more precise
	const questionDate = new Date(questionTime)
	const responseDate = new Date(responseTime)

	// Calculate days between dates
	const days = Math.floor((responseTime - questionTime) / (1000 * 60 * 60 * 24))
	const weekends = Math.floor(days / 7) * 2 + countWeekendDaysBetween(questionDate, responseDate)

	// Remove weekend hours (48 hours per weekend)
	const weekendHours = weekends * 24

	// Remove after-hours time (16 hours per weekday)
	const afterHoursPerDay = 16
	const weekdaysCount = days - weekends
	const afterHoursTotal = weekdaysCount * afterHoursPerDay

	// Adjust for partial days
	const questionHourOfDay = questionDate.getHours()
	const responseHourOfDay = responseDate.getHours()
	let partialDayAdjustment = 0

	if (questionHourOfDay < 9) {
		// Before business hours, add time until business hours start
		partialDayAdjustment += 9 - questionHourOfDay
	} else if (questionHourOfDay >= 17) {
		// After business hours, add time until midnight plus next day morning
		partialDayAdjustment += 24 - questionHourOfDay + 9
	}

	if (responseHourOfDay < 9) {
		// Response before business hours, subtract early morning hours
		partialDayAdjustment += responseHourOfDay
	} else if (responseHourOfDay >= 17) {
		// Response after business hours, subtract evening hours
		partialDayAdjustment += responseHourOfDay - 17
	}

	// Simplified business hours calculation
	const businessHours = Math.max(0, totalHours - weekendHours - afterHoursTotal - partialDayAdjustment)

	return businessHours
}

/**
 * Counts weekend days between two dates
 *
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns The number of weekend days between the dates
 */
function countWeekendDaysBetween(startDate: Date, endDate: Date): number {
	let count = 0
	const currentDate = new Date(startDate)

	// Set to beginning of day
	currentDate.setHours(0, 0, 0, 0)

	// Loop through each day
	while (currentDate < endDate) {
		const dayOfWeek = currentDate.getDay()

		// 0 = Sunday, 6 = Saturday
		if (dayOfWeek === 0 || dayOfWeek === 6) {
			count++
		}

		// Move to next day
		currentDate.setDate(currentDate.getDate() + 1)
	}

	return count
}
