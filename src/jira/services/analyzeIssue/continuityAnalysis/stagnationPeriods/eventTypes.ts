/**
 * Event Type Definitions for Stagnation Analysis
 *
 * This module defines the data structures used to track and analyze update events
 * in Jira issues. It provides interfaces for representing temporal events with their
 * associated status and assignee information, which are essential for identifying
 * periods of inactivity and calculating stagnation metrics across the issue lifecycle.
 */
export interface UpdateEvent {
	date: Date
	status: string | null
	assignee: string | null
}

/**
 * Default stagnation threshold in business days
 */
export const DEFAULT_STAGNATION_THRESHOLD_DAYS = 3
