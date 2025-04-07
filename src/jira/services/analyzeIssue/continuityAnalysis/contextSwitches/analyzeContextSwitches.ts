/**
 * Context Switch Analysis Module for Jira Issue Continuity
 *
 * This module identifies and analyzes context switches in Jira issues, primarily through
 * assignee changes. It tracks when assignee transitions occur, the statuses at which they happen,
 * and quantifies their impact on issue velocity and progress. Context switches often introduce
 * delays and knowledge transfer overhead, so understanding their frequency and timing provides
 * valuable insights into potential workflow inefficiencies and handoff-related bottlenecks.
 */
import { calculateBusinessDays } from '../utils/calculateBusinessDays'
import { extractAssigneeChangesFromChangelog } from './assigneeChanges'
import { assessVelocityImpact } from './velocityImpact'
import type { JiraIssue } from '../../../../types/issue.types'
import type { ContextSwitchEvent, ContextSwitchAnalysis } from '../types/continuityAnalysis.types'

/**
 * Analyzes assignee changes and their impact on issue velocity
 *
 * @param issue - The Jira issue to analyze
 * @returns Object containing context switch count, timing, and impact assessment
 */
export function analyzeContextSwitches(issue: JiraIssue): ContextSwitchAnalysis {
	// Extract assignee changes from changelog
	const assigneeChanges = extractAssigneeChangesFromChangelog(issue)

	// If no changes, return early
	if (assigneeChanges.length === 0) {
		return {
			count: 0,
			timing: [],
			impact: 'None - no assignee changes',
		}
	}

	// Format changes into ContextSwitch objects
	const contextSwitches: ContextSwitchEvent[] = assigneeChanges.map(function (change) {
		// Calculate days from issue creation
		const daysFromStart = calculateBusinessDays(issue.fields.created, change.date)

		return {
			date: change.date,
			fromAssignee: change.fromAssignee,
			toAssignee: change.toAssignee,
			status: change.status || 'Unknown',
			daysFromStart,
		}
	})

	// Assess impact on velocity
	const impact = assessVelocityImpact(issue, assigneeChanges)

	return {
		count: assigneeChanges.length,
		timing: contextSwitches,
		impact,
	}
}
