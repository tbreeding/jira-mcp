import { getInternalContextualRequirements } from '../getInternalContextualRequirements'
import type { JiraIssue } from '../../../../../types/issue.types'

describe('getInternalContextualRequirements', () => {
	// Helper to create a mock issue
	function createMockIssue(issueType: string): JiraIssue {
		return {
			id: '12345',
			key: 'TEST-123',
			self: 'https://example.com/jira/rest/api/2/issue/12345',
			fields: {
				summary: 'Test Issue',
				issuetype: {
					id: '1',
					name: issueType,
					subtask: issueType === 'Sub-task',
					description: `A ${issueType.toLowerCase()}`,
					self: 'https://example.com/jira/rest/api/2/issuetype/1',
					iconUrl: 'https://example.com/jira/images/icons/task.svg',
					avatarId: 10318,
					hierarchyLevel: 0,
				},
			},
		} as unknown as JiraIssue
	}

	it('should set defaults for all requirements', () => {
		const issue = createMockIssue('CustomType')
		const requirements = getInternalContextualRequirements(issue)

		expect(requirements).toEqual({
			needsTechnicalConstraints: true,
			needsTestingRequirements: true,
			needsDesignSpecifications: true,
			needsUserImpact: true,
		})
	})

	it('should ensure testing requirements for bugs', () => {
		const issue = createMockIssue('Bug')
		const requirements = getInternalContextualRequirements(issue)

		expect(requirements.needsTestingRequirements).toBe(true)
	})

	it('should disable technical constraints and testing for epics', () => {
		const issue = createMockIssue('Epic')
		const requirements = getInternalContextualRequirements(issue)

		expect(requirements.needsTechnicalConstraints).toBe(false)
		expect(requirements.needsTestingRequirements).toBe(false)
		expect(requirements.needsDesignSpecifications).toBe(true)
		expect(requirements.needsUserImpact).toBe(true)
	})

	it('should use default requirements for tasks', () => {
		const issue = createMockIssue('Task')
		const requirements = getInternalContextualRequirements(issue)

		expect(requirements).toEqual({
			needsTechnicalConstraints: true,
			needsTestingRequirements: true,
			needsDesignSpecifications: true,
			needsUserImpact: true,
		})
	})

	it('should use default requirements for sub-tasks', () => {
		const issue = createMockIssue('Sub-task')
		const requirements = getInternalContextualRequirements(issue)

		expect(requirements).toEqual({
			needsTechnicalConstraints: true,
			needsTestingRequirements: true,
			needsDesignSpecifications: true,
			needsUserImpact: true,
		})
	})

	it('should handle case-insensitive issue type comparisons', () => {
		// Using mixed case to test case insensitivity
		const issue = createMockIssue('EpIc')
		const requirements = getInternalContextualRequirements(issue)

		expect(requirements.needsTechnicalConstraints).toBe(false)
		expect(requirements.needsTestingRequirements).toBe(false)
	})
})
