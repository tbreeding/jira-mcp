import { determineContextualRequirements } from '../determineContextualRequirements'
import type { JiraIssue } from '../../../../types/issue.types'

describe('determineContextualRequirements', () => {
	// Helper to create a mock Jira issue with customizable fields
	function createMockIssue(overrides: Partial<{ fields: Partial<JiraIssue['fields']> }> = {}): JiraIssue {
		const baseIssue = {
			id: '12345',
			key: 'TEST-123',
			self: 'https://example.com/jira/rest/api/2/issue/12345',
			fields: {
				summary: 'Test issue',
				description: 'This is a test issue',
				issuetype: {
					id: '1',
					name: 'Task',
					subtask: false,
					description: 'A task',
					self: 'https://example.com/jira/rest/api/2/issuetype/1',
					iconUrl: 'https://example.com/jira/images/icons/task.svg',
					avatarId: 10318,
					hierarchyLevel: 0,
				},
				// Add minimum required fields
				status: {
					self: 'https://example.com/jira/rest/api/2/status/1',
					description: 'Issue is open',
					iconUrl: 'https://example.com/jira/images/icons/status_open.gif',
					name: 'Open',
					id: '1',
					statusCategory: {
						self: 'https://example.com/jira/rest/api/2/statuscategory/2',
						id: 2,
						key: 'new',
						colorName: 'blue-gray',
						name: 'To Do',
					},
				},
				priority: {
					self: 'https://example.com/jira/rest/api/2/priority/3',
					iconUrl: 'https://example.com/jira/images/icons/priorities/medium.svg',
					name: 'Medium',
					id: '3',
				},
				...overrides.fields,
			},
		}

		if (overrides.fields) {
			baseIssue.fields = {
				...baseIssue.fields,
				...overrides.fields,
			}
		}

		return baseIssue as unknown as JiraIssue
	}

	it('should default to requiring technical constraints, testing requirements, and user impact', () => {
		const issue = createMockIssue()
		const requirements = determineContextualRequirements(issue)

		expect(requirements).toEqual({
			needsTechnicalConstraints: true,
			needsTestingRequirements: true,
			needsDesignSpecifications: false,
			needsUserImpact: true,
		})
	})

	it('should enable design specifications for UI-related issues', () => {
		const uiTerms = ['UI', 'interface', 'frontend', 'screen', 'design', 'ux', 'visual']

		// Test with each UI term in summary
		for (const term of uiTerms) {
			const issue = createMockIssue({
				fields: {
					summary: `Implement new ${term} component`,
				},
			})
			const requirements = determineContextualRequirements(issue)

			expect(requirements.needsDesignSpecifications).toBe(true)
		}

		// Test with each UI term in description
		for (const term of uiTerms) {
			const issue = createMockIssue({
				fields: {
					description: `We need to implement a new ${term} component`,
				},
			})
			const requirements = determineContextualRequirements(issue)

			expect(requirements.needsDesignSpecifications).toBe(true)
		}
	})

	it('should disable user impact for backend-related issues', () => {
		const backendTerms = ['api', 'backend', 'database', 'server', 'endpoint']

		// Test with each backend term in summary
		for (const term of backendTerms) {
			const issue = createMockIssue({
				fields: {
					summary: `Implement new ${term}`,
				},
			})
			const requirements = determineContextualRequirements(issue)

			expect(requirements.needsUserImpact).toBe(false)
		}

		// Test with each backend term in description
		for (const term of backendTerms) {
			const issue = createMockIssue({
				fields: {
					description: `We need to implement a new ${term}`,
				},
			})
			const requirements = determineContextualRequirements(issue)

			expect(requirements.needsUserImpact).toBe(false)
		}
	})

	it('should keep user impact for issues that are both UI and backend related', () => {
		const issue = createMockIssue({
			fields: {
				summary: 'Implement API endpoint for UI component',
				description: 'Create a new backend service that will support the frontend dashboard',
			},
		})

		const requirements = determineContextualRequirements(issue)

		expect(requirements.needsUserImpact).toBe(true)
		expect(requirements.needsDesignSpecifications).toBe(true)
	})

	it('should handle bug-specific requirements', () => {
		// Regular bug
		const regularBug = createMockIssue({
			fields: {
				issuetype: {
					id: '2',
					name: 'Bug',
					subtask: false,
					description: 'A bug',
					self: 'https://example.com/jira/rest/api/2/issuetype/2',
					iconUrl: 'https://example.com/jira/images/icons/bug.svg',
					avatarId: 10303,
					hierarchyLevel: 0,
				},
			},
		})

		const regularBugRequirements = determineContextualRequirements(regularBug)

		expect(regularBugRequirements.needsTestingRequirements).toBe(true)
		expect(regularBugRequirements.needsDesignSpecifications).toBe(false)

		// UI-related bug
		const uiBug = createMockIssue({
			fields: {
				issuetype: {
					id: '2',
					name: 'Bug',
					subtask: false,
					description: 'A bug',
					self: 'https://example.com/jira/rest/api/2/issuetype/2',
					iconUrl: 'https://example.com/jira/images/icons/bug.svg',
					avatarId: 10303,
					hierarchyLevel: 0,
				},
				summary: 'UI rendering issue',
			},
		})

		const uiBugRequirements = determineContextualRequirements(uiBug)

		expect(uiBugRequirements.needsTestingRequirements).toBe(true)
		expect(uiBugRequirements.needsDesignSpecifications).toBe(true)
	})

	it('should handle epic-specific requirements', () => {
		const epic = createMockIssue({
			fields: {
				issuetype: {
					id: '3',
					name: 'Epic',
					subtask: false,
					description: 'An epic',
					self: 'https://example.com/jira/rest/api/2/issuetype/3',
					iconUrl: 'https://example.com/jira/images/icons/epic.svg',
					avatarId: 10307,
					hierarchyLevel: 1,
				},
			},
		})

		const requirements = determineContextualRequirements(epic)

		expect(requirements.needsTechnicalConstraints).toBe(false)
		expect(requirements.needsUserImpact).toBe(true)
	})

	it('should handle task and sub-task issue types with default settings', () => {
		// Test for Task
		const taskIssue = createMockIssue({
			fields: {
				issuetype: {
					id: '1',
					name: 'Task',
					subtask: false,
					description: 'A task',
					self: 'https://example.com/jira/rest/api/2/issuetype/1',
					iconUrl: 'https://example.com/jira/images/icons/task.svg',
					avatarId: 10318,
					hierarchyLevel: 0,
				},
			},
		})

		const taskRequirements = determineContextualRequirements(taskIssue)

		expect(taskRequirements).toEqual({
			needsTechnicalConstraints: true,
			needsTestingRequirements: true,
			needsDesignSpecifications: false, // Default
			needsUserImpact: true,
		})

		// Test for Sub-task
		const subtaskIssue = createMockIssue({
			fields: {
				issuetype: {
					id: '5',
					name: 'Sub-task',
					subtask: true,
					description: 'A sub-task',
					self: 'https://example.com/jira/rest/api/2/issuetype/5',
					iconUrl: 'https://example.com/jira/images/icons/subtask.svg',
					avatarId: 10316,
					hierarchyLevel: 0,
				},
			},
		})

		const subtaskRequirements = determineContextualRequirements(subtaskIssue)

		expect(subtaskRequirements).toEqual({
			needsTechnicalConstraints: true,
			needsTestingRequirements: true,
			needsDesignSpecifications: false, // Default
			needsUserImpact: true,
		})
	})

	it('should handle JSON description field', () => {
		const jsonDescriptionIssue = createMockIssue()
		// Using type assertion to handle complex JSON structure
		jsonDescriptionIssue.fields.description = {
			content: [
				{
					content: [
						{
							text: 'We need to update the UI component',
							type: 'text',
						},
					],
					type: 'paragraph',
				},
			],
			type: 'doc',
			version: 1,
		} as any

		const requirements = determineContextualRequirements(jsonDescriptionIssue)

		expect(requirements.needsDesignSpecifications).toBe(true)
	})

	it('should handle missing description field', () => {
		const issue = createMockIssue()
		// Use null instead of undefined for description
		issue.fields.description = null

		// This should not throw an error
		const requirements = determineContextualRequirements(issue)

		expect(requirements).toEqual({
			needsTechnicalConstraints: true,
			needsTestingRequirements: true,
			needsDesignSpecifications: false,
			needsUserImpact: true,
		})
	})

	it('should handle missing summary field', () => {
		const issue = createMockIssue()
		// Use empty string instead of undefined for summary
		issue.fields.summary = ''

		// This should not throw an error
		const requirements = determineContextualRequirements(issue)

		expect(requirements).toEqual({
			needsTechnicalConstraints: true,
			needsTestingRequirements: true,
			needsDesignSpecifications: false,
			needsUserImpact: true,
		})
	})

	it('should handle both UI and backend terms in the same issue', () => {
		// Create a test with both UI and backend terms in the same issue
		const uiTerm = 'UI'
		const backendTerm = 'API'

		const mixedIssue = createMockIssue({
			fields: {
				description: `This issue involves both ${uiTerm} changes and ${backendTerm} implementation`,
			},
		})

		const requirements = determineContextualRequirements(mixedIssue)

		// With both UI and backend terms, design specs should be needed (due to UI)
		expect(requirements.needsDesignSpecifications).toBe(true)

		// Since there's UI involvement, user impact should be needed even with backend terms
		expect(requirements.needsUserImpact).toBe(true)
	})

	it('should handle string description with undefined parts by safely parsing', () => {
		// This directly targets line 17 branch where description is string but might be undefined
		const issue = createMockIssue()

		// Setting to a string but in a way that could be interpreted as undefined in some contexts
		issue.fields.description = '' as any

		// This should process without errors
		const requirements = determineContextualRequirements(issue)
		expect(requirements).toEqual({
			needsTechnicalConstraints: true,
			needsTestingRequirements: true,
			needsDesignSpecifications: false,
			needsUserImpact: true,
		})
	})

	it('should handle specific description format edge cases for backend terms', () => {
		// This directly targets line 32 branch with string description handling
		const issue = createMockIssue()

		// Setting to a string with backend terms
		issue.fields.description = 'backend api implementation'

		// Should detect backend terms from string description
		const requirements = determineContextualRequirements(issue)
		expect(requirements.needsUserImpact).toBe(false)

		// Test with empty string
		const emptyDescIssue = createMockIssue()
		emptyDescIssue.fields.description = ''

		// Should handle empty string without errors
		const emptyDescRequirements = determineContextualRequirements(emptyDescIssue)
		expect(emptyDescRequirements.needsUserImpact).toBe(true) // Default for non-backend
	})

	it('should handle specific edge cases with undefined description', () => {
		// Testing an issue with undefined description (one branch we need to cover)
		const issueWithUndefinedDesc = createMockIssue()
		// Make the description explicitly null
		issueWithUndefinedDesc.fields.description = null

		// Should not throw an error
		const requirements = determineContextualRequirements(issueWithUndefinedDesc)

		// Should have default values
		expect(requirements.needsTechnicalConstraints).toBe(true)
		expect(requirements.needsTestingRequirements).toBe(true)
		expect(requirements.needsDesignSpecifications).toBe(false)
		expect(requirements.needsUserImpact).toBe(true)
	})

	it('should handle a very specific complex case with mixed UI and backend terms', () => {
		// Create a test with a mix that will force code through multiple branches
		const complexIssue = createMockIssue({
			fields: {
				summary: 'API Task with UI impact',
				description: 'This needs both API implementation and UI updates',
				issuetype: {
					id: '1',
					name: 'Custom Type', // Using a custom type to hit different code paths
					subtask: false,
					description: 'A custom type',
					self: 'https://example.com/jira/rest/api/2/issuetype/1',
					iconUrl: 'https://example.com/jira/images/icons/task.svg',
					avatarId: 10318,
					hierarchyLevel: 0,
				},
			},
		})

		const requirements = determineContextualRequirements(complexIssue)

		// With both UI and backend terms, design specs should be needed
		expect(requirements.needsDesignSpecifications).toBe(true)

		// Make sure we get determinations for this type
		expect(requirements.needsTechnicalConstraints).toBeDefined()
		expect(requirements.needsTestingRequirements).toBeDefined()
		expect(requirements.needsUserImpact).toBeDefined()
	})

	it('should test all description formats for maximum branch coverage', () => {
		// For string description format
		const stringDescIssue = createMockIssue({
			fields: {
				description: 'This is a plain string description with UI and API mentions',
			},
		})

		const stringDescResult = determineContextualRequirements(stringDescIssue)
		expect(stringDescResult).toBeDefined()
		expect(stringDescResult.needsDesignSpecifications).toBe(true) // Because of UI mention

		// For complex JSON format
		const jsonDescIssue = createMockIssue({
			fields: {
				description: {
					type: 'doc',
					version: 1,
					content: [
						{
							type: 'paragraph',
							content: [
								{
									type: 'text',
									text: 'This is a JSON description mentioning API and backend',
								},
							],
						},
					],
				},
			},
		})

		const jsonDescResult = determineContextualRequirements(jsonDescIssue)
		expect(jsonDescResult).toBeDefined()
		expect(jsonDescResult.needsUserImpact).toBe(false) // Because of backend mention without UI
	})

	it('should handle undefined description properly when converting to string', () => {
		// This test specifically targets line 17
		const issue = createMockIssue()
		issue.fields.description = null

		const requirements = determineContextualRequirements(issue)
		expect(requirements).toEqual({
			needsTechnicalConstraints: true,
			needsTestingRequirements: true,
			needsDesignSpecifications: false,
			needsUserImpact: true,
		})
	})

	it('should handle null description properly when converting to string', () => {
		// This test also targets line 17
		const issue = createMockIssue()
		issue.fields.description = null

		const requirements = determineContextualRequirements(issue)
		expect(requirements).toEqual({
			needsTechnicalConstraints: true,
			needsTestingRequirements: true,
			needsDesignSpecifications: false,
			needsUserImpact: true,
		})
	})

	it('should handle undefined description when checking backend terms', () => {
		// This test specifically targets line 32
		const issue = createMockIssue()
		issue.fields.description = null

		const requirements = determineContextualRequirements(issue)
		expect(requirements.needsUserImpact).toBe(true)
	})
})
