/**
 * State management utilities for flow efficiency analysis
 *
 * This file provides functionality for tracking and managing issue state
 * transitions in Jira workflows, ensuring accurate representation of issue
 * status changes and their timing for flow efficiency calculations.
 */

import { isActiveStatus } from '../utils/isActiveStatus'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Initializes the state for processing
 *
 * @param issue - The Jira issue
 * @returns Initial state
 */
export function initializeState(issue: JiraIssue): {
	currentDate: Date
	currentStatus: string | null
	inActiveStatus: boolean
} {
	const currentDate = new Date(issue.fields.created)
	const currentStatus = issue.fields.status?.name || null
	const inActiveStatus = currentStatus ? isActiveStatus(currentStatus) : false

	return { currentDate, currentStatus, inActiveStatus }
}

/**
 * Updates state based on a status change
 *
 * @param change - The status change
 * @returns Updated state
 */
export function updateState(change: { date: Date; fromStatus: string | null; toStatus: string | null }): {
	currentDate: Date
	currentStatus: string | null
	inActiveStatus: boolean
} {
	const currentDate = change.date
	const currentStatus = change.toStatus
	const inActiveStatus = currentStatus ? isActiveStatus(currentStatus) : false

	return { currentDate, currentStatus, inActiveStatus }
}
