/**
 * Velocity Impact Assessment Module for Context Switch Analysis
 *
 * This module evaluates how assignee changes impact the velocity and progress of Jira issues.
 * It analyzes patterns in assignee transitions, considering factors like timing in the issue lifecycle,
 * frequency of changes, number of unique assignees, and whether changes occurred during active
 * development phases. The assessment categorizes impact severity from minimal to significant.
 */
import { identifyLateStageSwitches } from './lateStageSwitches'
import type { AssigneeChange } from './types/contextSwitches.types'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Assesses the impact of assignee changes on issue velocity
 *
 * @param issue - The Jira issue
 * @param assigneeChanges - The list of assignee changes
 * @returns A string describing the velocity impact
 */
export function assessVelocityImpact(issue: JiraIssue, assigneeChanges: AssigneeChange[]): string {
	// If no changes or only one change (initial assignment), no impact
	if (assigneeChanges.length <= 1) {
		return 'Minimal - single assignee throughout'
	}

	// Check if changes occurred in late stages
	const lateSwitches = identifyLateStageSwitches(issue, assigneeChanges)
	if (lateSwitches.length > 0) {
		return 'Significant - late stage assignee changes'
	}

	// Check if there were multiple back-and-forth changes
	const uniqueAssignees = new Set(
		assigneeChanges
			.map(function (change) {
				return change.toAssignee
			})
			.filter(function (assignee) {
				return assignee !== null
			}),
	)

	if (uniqueAssignees.size > 2 && assigneeChanges.length > 3) {
		return 'High - multiple assignees with frequent changes'
	}

	// Check if changes happened during active development
	const activeDevSwitches = assigneeChanges.filter(function (change) {
		return (
			change.status &&
			(change.status.toLowerCase().includes('progress') || change.status.toLowerCase().includes('developing'))
		)
	})

	if (activeDevSwitches.length > 0) {
		return 'Moderate - assignee changes during active development'
	}

	return 'Low - assignee changes at logical handoff points'
}
