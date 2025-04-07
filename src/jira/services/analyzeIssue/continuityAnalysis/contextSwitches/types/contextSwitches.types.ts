/**
 * Type definitions for context switch analysis in the Jira continuity analysis system.
 * These types help track and analyze assignee changes and their impacts on issue flow.
 */

/**
 * Represents a change in assignee for a Jira issue
 */
export type AssigneeChange = {
	date: string
	fromAssignee: string | null
	toAssignee: string | null
	status: string | null
}
