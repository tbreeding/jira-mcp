/**
 * Jira Issue Comment Type Definitions
 *
 * This module defines the TypeScript interfaces for Jira issue comments and comment collections.
 * It provides type definitions for the API response structure when fetching comments, as well as
 * the detailed structure of individual comments, including author information, content structure,
 * and metadata. These types enable type-safe processing of comment data throughout the application,
 * supporting features like text extraction, content analysis, and comment-related metrics.
 */

export interface IssueCommentResponse {
	startAt: number
	maxResults: number
	total: number
	comments: IssueComment[]
}

export interface IssueComment {
	author?: {
		accountId: string
		accountType: string
		active: boolean
		avatarUrls: {
			'16x16': string
			'24x24': string
			'32x32': string
			'48x48': string
		}
		displayName: string
		emailAddress?: string
		self: string
		timeZone: string
	}
	body: {
		content: {
			content: {
				text: string
				type: string
			}[]
			type: string
		}[]
		type: string
		version: number
	}
	created: Date
	id: string
	jsdPublic: boolean
	self: string
	updateAuthor?: {
		accountId: string
		accountType: string
		active: boolean
		avatarUrls: {
			'16x16': string
			'24x24': string
			'32x32': string
			'48x48': string
		}
		displayName: string
		emailAddress?: string
		self: string
		timeZone: string
	}
	updated: Date
}
