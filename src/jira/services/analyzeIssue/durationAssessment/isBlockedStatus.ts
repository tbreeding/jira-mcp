/**
 * Blocked Status Detector
 *
 * This utility provides functionality to determine whether an issue is in a blocked state
 * based on its status name. It analyzes status text to identify keywords or patterns that
 * indicate blocked conditions. By examining these status indicators, the module helps track
 * when issues enter impediment states, which is crucial for calculating blocked time metrics,
 * identifying workflow bottlenecks, and analyzing the impact of blocked issues on team productivity
 * and delivery timelines.
 */

/**
 * Defines which status keywords indicate a blocked state
 */
const BLOCKED_STATUS_KEYWORDS = ['blocked', 'on hold', 'waiting', 'pending', 'impediment']

/**
 * Checks if a status indicates the issue is blocked
 * @param status Status name to check
 * @returns True if the status indicates a blocked state
 */
export function isBlockedStatus(status: string | null): boolean {
	if (!status) {
		return false
	}

	return BLOCKED_STATUS_KEYWORDS.some((keyword) => status.toLowerCase().includes(keyword))
}
