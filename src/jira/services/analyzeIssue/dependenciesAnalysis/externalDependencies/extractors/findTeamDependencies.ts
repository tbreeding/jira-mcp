/**
 * This file provides functionality to identify team-related dependencies in Jira issue text.
 * It searches for mentions of teams, departments, or organizational units that may indicate
 * cross-team dependencies. These dependencies are important to highlight as they often
 * require coordination across organizational boundaries, which can introduce additional
 * complexity and potential delays in issue resolution. Detecting these dependencies helps
 * teams proactively manage cross-functional collaboration requirements.
 */

import { findDependencies } from '../findDependencies'
import { TEAM_INDICATORS } from '../indicators/teamIndicators'

/**
 * Finds team dependencies in text
 */
export function findTeamDependencies(text: string): string[] {
	return findDependencies(text, TEAM_INDICATORS)
}
