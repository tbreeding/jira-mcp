/**
 * Status Cycling Detector
 *
 * This module identifies patterns of status cycling in issue workflows, where issues repeatedly
 * move back and forth between the same statuses. It analyzes the transition history to detect
 * when issues are caught in loops between states, which often indicates process inefficiencies,
 * unclear requirements, or quality issues. By identifying these patterns, teams can address
 * underlying problems in their workflow, improve process stability, and reduce wasted effort.
 */
import { extractStatusTransitions } from './extractStatusTransitions'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Detects status cycling (revisiting previous statuses)
 * @param issue The Jira issue to analyze
 * @returns Object containing status cycling statistics
 */
export function detectStatusCycling(issue: JiraIssue): {
	count: Record<string, number>
	totalRevisits: number
} {
	const transitions = extractStatusTransitions(issue)

	// Initialize counters
	const visitedStatuses = new Set<string>()
	const revisitCounts: Record<string, number> = {}
	let totalRevisits = 0

	// Track status visits
	for (const transition of transitions) {
		const status = transition.toStatus

		if (status) {
			// If we've seen this status before, it's a revisit
			if (visitedStatuses.has(status)) {
				revisitCounts[status] = (revisitCounts[status] || 0) + 1
				totalRevisits++
			} else {
				// First visit to this status
				visitedStatuses.add(status)
				revisitCounts[status] = 0
			}
		}
	}

	return {
		count: revisitCounts,
		totalRevisits,
	}
}
