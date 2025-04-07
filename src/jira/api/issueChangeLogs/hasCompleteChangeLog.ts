/**
 * Changelog completeness verification utility
 *
 * This file provides functionality to determine whether a Jira issue's changelog
 * is complete and has all the necessary historical data. It helps ensure that
 * analysis based on changelog data is accurate and comprehensive.
 */

import type { IssueChangeLog } from '../../types/issue.types'

export function hasCompleteChangeLog(changeLog: IssueChangeLog): boolean {
	return changeLog.total === changeLog.maxResults
}
