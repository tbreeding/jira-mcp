/**
 * Regular expression pattern for matching Jira issue keys (e.g., PROJECT-123)
 */
export const ISSUE_KEY_PATTERN = /[A-Z][A-Z0-9_]+-\d+/g

/**
 * Extracts all issue keys from a text string
 */
export function extractIssueKeys(text: string): string[] {
	if (!text) {
		return []
	}
	return text.match(ISSUE_KEY_PATTERN) || []
}
