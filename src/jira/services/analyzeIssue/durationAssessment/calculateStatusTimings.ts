/**
 * Status Timings Calculator
 *
 * This module analyzes the time spent by issues in different workflow states.
 * It calculates precise timings for each status transition, accounting for business days
 * and working hours. These calculations support metrics such as cycle time, lead time,
 * and time distribution across workflow states. The resulting data helps teams identify
 * bottlenecks, optimize processes, and make data-driven decisions about workflow improvements.
 */
import { calculateHoursPerStatus } from './calculateHoursPerStatus'
import { convertTransitionsToPeriods } from './convertTransitionsToPeriods'
import { extractStatusTransitions } from './extractStatusTransitions'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Calculates the average time spent in each status
 * @param issue The Jira issue to analyze
 * @returns Record mapping status names to hours spent
 */
export function calculateStatusTimings(issue: JiraIssue): Record<string, number> {
	const transitions = extractStatusTransitions(issue)

	if (transitions.length === 0) {
		return {}
	}

	const statusPeriods = convertTransitionsToPeriods(transitions)
	return calculateHoursPerStatus(statusPeriods)
}
