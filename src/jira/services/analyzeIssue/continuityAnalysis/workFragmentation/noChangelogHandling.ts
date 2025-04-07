/**
 * This file provides special handling for Jira issues that lack changelog history information.
 * It implements a fallback strategy to create a single work period based on the issue's current
 * state when conventional timeline analysis isn't possible due to missing historical data.
 * The function checks if the current status is active and, if so, creates a work period spanning
 * from creation to current/resolution date, ensuring that even issues with limited history can
 * be included in work fragmentation and continuity analysis with reasonable approximations.
 */

import { createWorkPeriodFromDates } from '../utils/activePeriods/createWorkPeriodFromDates'
import { isActiveStatus } from '../utils/isActiveStatus'
import { calculateIssueDates } from '../utils/issueDates/calculateIssueDates'
import type { JiraIssue } from '../../../../types/issue.types'
import type { ActiveWorkPeriod } from '../types/continuityAnalysis.types'

/**
 * Handles issues without a changelog by creating a single work period if appropriate
 *
 * @param issue - The Jira issue to analyze
 * @returns Array of active work periods (may be empty)
 */
export function handleIssueWithoutChangelog(issue: JiraIssue): ActiveWorkPeriod[] {
	const activeWorkPeriods: ActiveWorkPeriod[] = []

	// If current status is not active, return empty array
	const currentStatus = issue.fields.status?.name
	if (!currentStatus || !isActiveStatus(currentStatus)) {
		return activeWorkPeriods
	}

	// Calculate dates and duration for the work period
	const periodDates = calculateIssueDates(issue)
	const workPeriod = createWorkPeriodFromDates(
		periodDates.startDate,
		periodDates.endDate,
		currentStatus,
		issue.fields.assignee?.displayName || null,
	)

	activeWorkPeriods.push(workPeriod)
	return activeWorkPeriods
}
