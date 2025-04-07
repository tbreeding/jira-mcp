/**
 * This file implements the primary workflow for analyzing work fragmentation in Jira issues.
 * It coordinates the process of identifying active work periods and calculating fragmentation
 * scores based on those periods. Work fragmentation analysis reveals how continuously work
 * progressed on an issue, with higher scores indicating less fragmented (more cohesive) work.
 * This analysis is valuable for detecting workflow inefficiencies and context switching problems.
 */

import { calculateFragmentationScore } from './fragmentationScoring'
import { identifyActiveWorkPeriods } from './identifyActivePeriods'
import type { JiraIssue } from '../../../../types/issue.types'
import type { WorkFragmentationAnalysis } from '../types/continuityAnalysis.types'

/**
 * Analyzes work fragmentation by identifying active work periods and scoring continuity
 *
 * @param issue - The Jira issue to analyze
 * @returns Object containing fragmentation score and active work periods count
 */
export function analyzeWorkFragmentation(issue: JiraIssue): WorkFragmentationAnalysis {
	// Identify active work periods
	const activeWorkPeriods = identifyActiveWorkPeriods(issue)

	// Calculate fragmentation score
	const fragmentationScore = calculateFragmentationScore(activeWorkPeriods)

	return {
		fragmentationScore,
		activeWorkPeriods: activeWorkPeriods.length,
	}
}
