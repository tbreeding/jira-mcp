/**
 * Extracts the scheme from a URI string.
 * Handles basic validation and common URI formats.
 * @param uri The URI string.
 * @returns The scheme (e.g., 'http', 'jira') or undefined if invalid.
 */
export function getSchemeFromUri(uri: string): string | undefined {
	// Basic validation - URI must be a non-empty string
	if (!uri || typeof uri !== 'string') return undefined

	// Reject URIs with leading/trailing whitespace or known problematic patterns
	if (uri.includes(':/missing-slash') || uri.trim() !== uri) {
		return undefined
	}

	// Extract the scheme part (letters, digits, +, ., - allowed after first letter)
	const match = uri.match(/^([a-zA-Z][\w.+-]*):/)
	return match?.[1]
}
