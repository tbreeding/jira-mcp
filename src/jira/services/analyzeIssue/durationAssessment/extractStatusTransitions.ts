/**
 * Status Transition Extractor
 *
 * This utility extracts the chronological sequence of status transitions from a Jira issue's
 * change history. It processes the raw history data to create a structured timeline of when
 * the issue moved between different workflow states. This transition data forms the foundation
 * for analyzing workflow patterns, calculating time-in-status metrics, and identifying
 * bottlenecks or inefficiencies in the development process.
 */
import { determineStatusCategory } from './statusCategories'
import type { StatusTransition } from './types/durationAssessment.types'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Creates a status transition object from changelog item
 * @param item The changelog item
 * @param timestamp The timestamp of the transition
 * @returns Status transition object
 */
function createTransition(
	item: { fromString: string | null; toString: string | null },
	timestamp: string,
): StatusTransition {
	const transition: StatusTransition = {
		fromStatus: item.fromString,
		toStatus: item.toString,
		fromStatusCategory: determineStatusCategory(item.fromString),
		toStatusCategory: determineStatusCategory(item.toString),
		timestamp,
	}

	return transition
}

/**
 * Extracts all status transitions from an issue's changelog
 * @param issue The Jira issue to analyze
 * @returns Array of status transitions with timestamps
 */
export function extractStatusTransitions(issue: JiraIssue): StatusTransition[] {
	const transitions: StatusTransition[] = []

	// Check if changelog exists and has histories
	if (!issue.changelog || !issue.changelog.histories || !Array.isArray(issue.changelog.histories)) {
		return transitions
	}

	// Get all history entries sorted by created date
	const histories = [...issue.changelog.histories].sort(
		(a, b) => new Date(a.created).getTime() - new Date(b.created).getTime(),
	)

	// Extract status transitions
	for (const history of histories) {
		const statusItems = history.items.filter((item) => item.field === 'status')

		for (const item of statusItems) {
			const transition = createTransition(item, history.created)
			transitions.push(transition)
		}
	}

	return transitions
}
