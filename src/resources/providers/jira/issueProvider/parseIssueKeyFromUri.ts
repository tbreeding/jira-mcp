/**
 * Extracts the Jira issue key from a URI.
 * @param uri The URI string (e.g., jira://instance/issue/KEY-123)
 * @returns The extracted issue key or undefined if not found.
 */

export function parseIssueKeyFromUri(uri: string): string | undefined {
	const match = uri.match(/issue\/([\w-]+)$/)
	return match?.[1]
}
