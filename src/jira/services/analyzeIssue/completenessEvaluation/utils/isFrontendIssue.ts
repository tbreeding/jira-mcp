/**
 * Determines if the issue is frontend-related based on its type
 */
export function isFrontendIssue(issueType: string): boolean {
	const frontendTerms = ['ui', 'frontend', 'interface', 'design', 'ux', 'visual', 'screen']
	return frontendTerms.some(function (term) {
		return issueType.toLowerCase().includes(term.toLowerCase())
	})
}
