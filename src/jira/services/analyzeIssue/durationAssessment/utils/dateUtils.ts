/**
 * Date Calculation Utilities for Duration Assessment Analysis
 *
 * This module provides a collection of utility functions for date and time calculations
 * used in analyzing Jira issue durations. It includes functionality for calculating
 * business days between dates (excluding weekends), validating date ranges, and
 * computing hour-based durations. These utilities enable accurate measurement of
 * work time spent on issues while accounting for non-working periods.
 */

/**
 * Checks if a date is a weekend (Saturday or Sunday)
 * @param date Date to check
 * @returns True if the date is a weekend
 */
function isWeekend(date: Date): boolean {
	const day = date.getDay()
	return day === 0 || day === 6 // 0 = Sunday, 6 = Saturday
}

/**
 * Validates dates for calculation
 * @param start Start date
 * @param end End date
 * @returns True if dates are valid and start is before or equal to end
 */
function areDatesValid(start: Date, end: Date): boolean {
	return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start.getTime() <= end.getTime()
}

/**
 * Calculates the number of business days between two dates
 * @param startDate Start date string in ISO format
 * @param endDate End date string in ISO format
 * @returns Number of business days between the dates
 */
export function calculateBusinessDays(startDate: string, endDate: string): number {
	const start = new Date(startDate)
	const end = new Date(endDate)

	// Early return if dates are invalid
	if (!areDatesValid(start, end)) {
		return 0
	}

	// Set to start of day
	start.setHours(0, 0, 0, 0)
	end.setHours(0, 0, 0, 0)

	// Count the days
	let count = 0
	const current = new Date(start)

	while (current.getTime() <= end.getTime()) {
		// Skip weekends
		if (!isWeekend(current)) {
			count++
		}

		// Go to next day
		current.setDate(current.getDate() + 1)
	}

	return count
}

/**
 * Calculates the duration in hours between two timestamps
 * @param startDate Start date string in ISO format
 * @param endDate End date string in ISO format
 * @returns Hours between the dates
 */
export function calculateHoursBetween(startDate: string, endDate: string): number {
	const start = new Date(startDate)
	const end = new Date(endDate)

	// Early return if dates are invalid
	if (!areDatesValid(start, end)) {
		return 0
	}

	const diffMs = end.getTime() - start.getTime()
	const diffHours = diffMs / (1000 * 60 * 60)

	return Math.round(diffHours * 10) / 10 // Round to 1 decimal place
}
