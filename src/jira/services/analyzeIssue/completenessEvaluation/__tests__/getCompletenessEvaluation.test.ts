import { checkDependencies } from '../checkDependencies'
import { getCompletenessEvaluation } from '../getCompletenessEvaluation'
import { getInternalContextualRequirements } from '../utils/getInternalContextualRequirements'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'
import type { CategoryCheckResult } from '../completenessEvaluation.types'

// Mock the dependencies
jest.mock('../checkDependencies')
jest.mock('../utils/getInternalContextualRequirements')

describe('getCompletenessEvaluation', () => {
	// Reset mocks before each test
	beforeEach(() => {
		jest.resetAllMocks()

		// Default mock implementations
		jest.mocked(getInternalContextualRequirements).mockReturnValue({
			needsTechnicalConstraints: true,
			needsTestingRequirements: true,
			needsDesignSpecifications: true,
			needsUserImpact: true,
		})

		jest.mocked(checkDependencies).mockReturnValue({
			missing: [],
			present: true,
			quality: 'complete',
		})
	})

	// Mock data
	const mockIssue = {
		key: 'TEST-123',
		fields: {
			summary: 'Test issue for completeness evaluation',
			issuetype: {
				name: 'Task',
			},
			description: {
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'This is a description with acceptance criteria:',
							},
						],
					},
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Given a user is logged in, When they click submit, Then the form data is saved.',
							},
						],
					},
				],
			},
			attachment: [
				{
					filename: 'mockup.jpg',
					content: 'base64content',
				},
			],
		},
	} as unknown as JiraIssue

	const mockCommentsResponse: IssueCommentResponse = {
		comments: [
			{
				id: '1',
				author: {
					accountId: 'user-123',
					accountType: 'atlassian',
					active: true,
					avatarUrls: {
						'16x16': 'avatar-url',
						'24x24': 'avatar-url',
						'32x32': 'avatar-url',
						'48x48': 'avatar-url',
					},
					displayName: 'Test User',
					self: 'self-link',
					timeZone: 'UTC',
				},
				body: {
					content: [
						{
							type: 'paragraph',
							content: [
								{
									type: 'text',
									text: 'We need to consider technical constraints like performance requirements.',
								},
							],
						},
					],
					type: 'doc',
					version: 1,
				},
				created: new Date('2023-01-01T10:00:00.000Z'),
				updated: new Date('2023-01-01T10:00:00.000Z'),
				jsdPublic: false,
				self: 'self-link',
			},
		],
		startAt: 0,
		maxResults: 10,
		total: 1,
	}

	it('should evaluate issue completeness', () => {
		const result = getCompletenessEvaluation(mockIssue, mockCommentsResponse)

		// Verify basic structure
		expect(result).toHaveProperty('score')
		expect(result).toHaveProperty('missingInformation')
		expect(result).toHaveProperty('suggestions')

		// Score should be a number between 1 and 10
		expect(result.score).toBeGreaterThanOrEqual(1)
		expect(result.score).toBeLessThanOrEqual(10)
	})

	it('should skip category checks when not needed by context', () => {
		// Setup getInternalContextualRequirements to return a context where various requirements are disabled
		jest.mocked(getInternalContextualRequirements).mockReturnValue({
			needsTechnicalConstraints: false,
			needsTestingRequirements: false,
			needsDesignSpecifications: false,
			needsUserImpact: false,
		})

		const result = getCompletenessEvaluation(mockIssue, mockCommentsResponse)

		// Verify that the result still has the expected structure
		expect(result).toHaveProperty('score')
		expect(result).toHaveProperty('missingInformation')
		expect(result).toHaveProperty('suggestions')
	})

	it('should include missing information from dependencies when present', () => {
		// Mock checkDependencies to return missing dependencies
		jest.mocked(checkDependencies).mockReturnValue({
			missing: ['Dependencies not identified', 'Missing critical dependency information'],
			present: false,
			quality: 'absent',
		} as CategoryCheckResult)

		const result = getCompletenessEvaluation(mockIssue, mockCommentsResponse)

		// Verify that the dependencies were included in missingInformation
		expect(result.missingInformation).toContain('Dependencies not identified')
		expect(result.missingInformation).toContain('Missing critical dependency information')
	})

	it('should not include missing information from dependencies when empty', () => {
		// This test specifically targets lines 47-51 in getCompletenessEvaluation.ts

		// Mock checkDependencies to return no missing dependencies
		jest.mocked(checkDependencies).mockReturnValue({
			missing: [],
			present: true,
			quality: 'complete',
		} as CategoryCheckResult)

		const result = getCompletenessEvaluation(mockIssue, mockCommentsResponse)

		// Verify that no dependency issues were included in missingInformation
		const hasDependencyIssues = result.missingInformation.some(
			(item) => item.includes('Dependency') || item.includes('dependency'),
		)
		expect(hasDependencyIssues).toBe(false)
	})

	it('should handle different issue types appropriately', () => {
		// Test with different issue types
		const issueTypes = ['Task', 'Bug', 'Epic', 'Story', 'CustomType']

		issueTypes.forEach((issueType) => {
			const testIssue = {
				...mockIssue,
				fields: {
					...mockIssue.fields,
					issuetype: { name: issueType },
				},
			} as unknown as JiraIssue

			const result = getCompletenessEvaluation(testIssue, mockCommentsResponse)

			// Just verify we get valid results for all issue types
			expect(result).toHaveProperty('score')
			expect(result).toHaveProperty('missingInformation')
			expect(result).toHaveProperty('suggestions')
		})
	})
})
