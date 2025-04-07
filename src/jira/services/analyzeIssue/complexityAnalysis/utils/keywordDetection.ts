/**
 * Utilities for detecting complexity keywords in issue descriptions and comments
 */
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Finds keywords in issue description and comments
 *
 * @param issue - The Jira issue to analyze
 * @param commentsResponse - Comments related to the issue
 * @param complexityKeywords - List of keywords to search for
 * @returns Array of found keywords
 */
export function findKeywordsInIssue(
	issue: JiraIssue,
	commentsResponse: IssueCommentResponse,
	complexityKeywords: string[],
): string[] {
	const keywordsFound: string[] = []

	findKeywordsInDescription(issue.fields.description, complexityKeywords, keywordsFound)
	findKeywordsInComments(commentsResponse.comments, complexityKeywords, keywordsFound)

	return keywordsFound
}

/**
 * Checks for keywords in the issue description
 *
 * @param description - The issue description
 * @param complexityKeywords - List of keywords to search for
 * @param keywordsFound - Array to store found keywords
 */
function findKeywordsInDescription(description: unknown, complexityKeywords: string[], keywordsFound: string[]): void {
	if (!description) {
		return
	}

	const descriptionText = typeof description === 'string' ? description : JSON.stringify(description)

	complexityKeywords.forEach(function (keyword) {
		if (isKeywordInText(descriptionText, keyword)) {
			keywordsFound.push(keyword)
		}
	})
}

/**
 * Checks for keywords in issue comments
 *
 * @param comments - List of issue comments
 * @param complexityKeywords - List of keywords to search for
 * @param keywordsFound - Array to store found keywords
 */
function findKeywordsInComments(
	comments: Array<{ body: unknown }>,
	complexityKeywords: string[],
	keywordsFound: string[],
): void {
	comments.forEach(function (comment) {
		const commentText = JSON.stringify(comment.body)

		complexityKeywords.forEach(function (keyword) {
			if (isKeywordInText(commentText, keyword) && !keywordsFound.includes(keyword)) {
				keywordsFound.push(keyword)
			}
		})
	})
}

/**
 * Checks if a keyword exists in text
 *
 * @param text - The text to search in
 * @param keyword - The keyword to search for
 * @returns True if keyword is found in text
 */
function isKeywordInText(text: string, keyword: string): boolean {
	return text.toLowerCase().includes(keyword.toLowerCase())
}
