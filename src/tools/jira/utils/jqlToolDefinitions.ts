/**
 * Jira JQL Search Tool Definition
 *
 * This file contains the definition for the JQL search tool, including
 * parameter schema and validation rules. The tool allows searching for
 * Jira issues using JQL (Jira Query Language).
 *
 * The tool includes advanced pagination support to help AI agents navigate
 * through large result sets efficiently. It returns complete pagination
 * metadata and utilities to assist with retrieving subsequent pages.
 */

/**
 * Schema for the JQL search tool
 */
export const getIssuesByJqlTool = {
	name: 'getIssuesByJql',
	description: 'Searches for Jira issues using a JQL query with pagination support for handling large result sets',
	inputSchema: {
		type: 'object' as const,
		properties: {
			jql: {
				type: 'string',
				description: 'The JQL query string to search for issues',
			},
			startAt: {
				type: 'number',
				description:
					'The index of the first issue to return (0-based). Use this for pagination through large result sets.',
				default: 0,
			},
			maxResults: {
				type: 'number',
				description:
					'The maximum number of issues to return per page. The response includes pagination metadata to help navigate to subsequent pages.',
				default: 50,
				maximum: 100,
			},
		},
		required: ['jql'],
	},
}
