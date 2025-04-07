/**
 * Communication Gaps Identification Module for Continuity Analysis
 *
 * This module analyzes the temporal distribution of communication events in Jira issues
 * to identify significant periods without communication. It processes all communication
 * touchpoints including comments, issue updates, and status changes to detect gaps that
 * exceed a configurable threshold. These gaps may indicate communication breakdowns,
 * project delays, or context switching that impact the overall flow and continuity of work.
 */
import { calculateBusinessDays } from '../utils/calculateBusinessDays'
import { getAllCommunicationEvents } from './eventCollection'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'
import type { CommunicationGap } from '../types/continuityAnalysis.types'

/**
 * Default gap threshold in business days
 */
const DEFAULT_COMMUNICATION_GAP_THRESHOLD_DAYS = 5

/**
 * Identifies periods without communication that exceed the threshold
 *
 * @param issue - The Jira issue to analyze
 * @param commentsResponse - The issue's comments
 * @param gapThresholdDays - The number of business days that constitutes a communication gap
 * @returns Array of communication gaps
 */
export function identifyCommunicationGaps(
	issue: JiraIssue,
	commentsResponse: IssueCommentResponse,
	gapThresholdDays = DEFAULT_COMMUNICATION_GAP_THRESHOLD_DAYS,
): CommunicationGap[] {
	// Get all communication events (comments, issue creation, resolution)
	const communicationEvents = getAllCommunicationEvents(issue, commentsResponse)

	// If fewer than 2 events, there can't be gaps between them
	if (communicationEvents.length < 2) {
		return []
	}

	// Sort events by date
	communicationEvents.sort((a: Date, b: Date) => a.getTime() - b.getTime())

	const communicationGaps: CommunicationGap[] = []

	// Check gaps between consecutive events
	for (let i = 0; i < communicationEvents.length - 1; i++) {
		const currentEvent = communicationEvents[i]
		const nextEvent = communicationEvents[i + 1]

		// Calculate business days between events
		const startDateStr = currentEvent.toISOString()
		const endDateStr = nextEvent.toISOString()
		const businessDays = calculateBusinessDays(startDateStr, endDateStr)

		// If exceeds threshold, add to communication gaps
		if (businessDays >= gapThresholdDays) {
			communicationGaps.push({
				startDate: startDateStr,
				endDate: endDateStr,
				durationDays: businessDays,
			})
		}
	}

	return communicationGaps
}
