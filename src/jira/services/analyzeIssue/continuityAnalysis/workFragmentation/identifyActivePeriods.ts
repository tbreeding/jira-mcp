/**
 * This file implements the core functionality for identifying active work periods in Jira issues.
 * It coordinates the process of extracting status changes, establishing initial state context,
 * and processing the chronological sequence of status transitions to detect distinct periods of
 * active work. The system also handles special cases like issues without changelog history.
 * These identified work periods are fundamental to fragmentation analysis and workflow efficiency metrics.
 */

import { extractStatusChanges } from './changelogProcessing'
import { processStatusChangesToFindActivePeriods } from './findActivePeriods'
import { handleIssueWithoutChangelog } from './noChangelogHandling'
import { getInitialState } from './stateManagement'
import type { JiraIssue } from '../../../../types/issue.types'
import type { ActiveWorkPeriod } from '../types/continuityAnalysis.types'

/**
 * Identifies distinct active work periods by analyzing status changes
 *
 * @param issue - The Jira issue to analyze
 * @returns Array of active work periods
 */
export function identifyActiveWorkPeriods(issue: JiraIssue): ActiveWorkPeriod[] {
	// If no changelog, we can't determine active periods normally
	if (!issue.changelog || !issue.changelog.histories || issue.changelog.histories.length === 0) {
		return handleIssueWithoutChangelog(issue)
	}

	// Get all status changes and sort by date
	const statusChanges = extractStatusChanges(issue)

	// Get initial state information
	const initialState = getInitialState(issue)

	// Process status changes to identify active periods
	return processStatusChangesToFindActivePeriods(issue, statusChanges, initialState)
}
