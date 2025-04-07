/**
 * Extracts the JQL query parameter from a URI.
 * @param uri The URI string (e.g., jira://instance/search?jql=...)
 * @returns The JQL query string or undefined if not found or URI is invalid.
 */
export function parseJqlFromUri(uri: string): string | undefined {
	try {
		// Convert jira:// to https:// temporarily for URL parsing
		const parsableUri = uri.replace(/^jira:\/\//, 'https://')
		const url = new URL(parsableUri)
		return url.searchParams.get('jql') ?? undefined
	} catch {
		// If URI parsing fails, return undefined
		return undefined
	}
}
