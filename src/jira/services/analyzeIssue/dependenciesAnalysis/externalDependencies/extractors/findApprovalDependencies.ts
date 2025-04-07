/**
 * This file provides functionality to identify approval-related dependencies in Jira issue text.
 * It uses specialized indicators related to approval processes (such as "sign-off", "review",
 * "approval", etc.) to detect when an issue is dependent on an approval step. These approval
 * dependencies often represent critical governance checkpoints in workflows and can become
 * blockers if not properly managed. The detection helps identify process dependencies that
 * may not be explicitly linked in the issue tracking system.
 */

import { findDependencies } from '../findDependencies'
import { APPROVAL_INDICATORS } from '../indicators/approvalIndicators'

/**
 * Finds approval dependencies in text
 */
export function findApprovalDependencies(text: string): string[] {
	return findDependencies(text, APPROVAL_INDICATORS)
}
