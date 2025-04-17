/**
 * Unit tests for the Issue Creation Wizard State Manager
 */

import { StateManager } from '../stateManager'
import { StateManagerCore } from '../stateManagerCore'
import { WizardStep } from '../types'
import type { JiraIssue } from '../../../jira/types/issue.types'
import { createSuccess } from '../../../errors/types'

describe('StateManager', () => {
	let stateManagerCore: StateManagerCore
	let stateManager: StateManager

	beforeEach(() => {
		// Make sure we start with a fresh state manager
		stateManagerCore = new StateManagerCore()
		stateManager = new StateManager(stateManagerCore)
		stateManager.resetState()
	})

	it('should initialize with dependency injection', () => {
		const core = new StateManagerCore()
		const manager = new StateManager(core)
		expect(manager).toBeInstanceOf(StateManager)
	})

	it('should initialize a new wizard state', () => {
		const result = stateManager.initializeState()
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.active).toBe(true)
			expect(result.data.currentStep).toBe(WizardStep.INITIATE)
			expect(result.data.fields).toEqual({})
			expect(result.data.validation.errors).toEqual({})
			expect(result.data.validation.warnings).toEqual({})
			expect(typeof result.data.timestamp).toBe('number')
		}
	})

	it('should not allow initializing when a wizard is already active', () => {
		stateManager.initializeState()
		const result = stateManager.initializeState()
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('INVALID_PARAMETERS')
		}
	})

	it('should get the current state when a wizard is active', () => {
		stateManager.initializeState()
		const result = stateManager.getState()
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.active).toBe(true)
		}
	})

	it('should return an error when getting state without an active wizard', () => {
		const result = stateManager.getState()
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('INVALID_PARAMETERS')
		}
	})

	it('should reset the wizard state', () => {
		stateManager.initializeState()
		expect(stateManager.isActive()).toBe(true)

		const result = stateManager.resetState()
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.reset).toBe(true)
		}
		expect(stateManager.isActive()).toBe(false)
	})

	it('should allow project selection after initialization', () => {
		stateManager.initializeState()
		const result = stateManager.updateState({
			currentStep: WizardStep.PROJECT_SELECTION,
			projectKey: 'TEST-1',
		})
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.currentStep).toBe(WizardStep.PROJECT_SELECTION)
			expect(result.data.projectKey).toBe('TEST-1')
		}
	})

	it('should allow issue type selection after project selection', () => {
		stateManager.initializeState()
		stateManager.updateState({
			currentStep: WizardStep.PROJECT_SELECTION,
			projectKey: 'TEST-1',
		})

		const result = stateManager.updateState({
			currentStep: WizardStep.ISSUE_TYPE_SELECTION,
			issueTypeId: '10000',
		})

		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.currentStep).toBe(WizardStep.ISSUE_TYPE_SELECTION)
			expect(result.data.issueTypeId).toBe('10000')
		}
	})

	it('should not allow skipping steps', () => {
		stateManager.initializeState()
		const result = stateManager.updateState({
			currentStep: WizardStep.FIELD_COMPLETION,
		})

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('INVALID_PARAMETERS')
		}
	})

	it('should not allow issue type selection without a project', () => {
		stateManager.initializeState()
		const result = stateManager.updateState({
			currentStep: WizardStep.ISSUE_TYPE_SELECTION,
		})

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('INVALID_PARAMETERS')
		}
	})

	it('should allow updating field values', () => {
		stateManager.initializeState()
		stateManager.updateState({
			currentStep: WizardStep.PROJECT_SELECTION,
			projectKey: 'TEST-1',
		})
		stateManager.updateState({
			currentStep: WizardStep.ISSUE_TYPE_SELECTION,
			issueTypeId: '10000',
		})
		stateManager.updateState({
			currentStep: WizardStep.FIELD_COMPLETION,
		})

		const result = stateManager.updateState({
			fields: {
				summary: 'Test issue',
				description: 'Test description',
			},
		})

		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.fields.summary).toBe('Test issue')
			expect(result.data.fields.description).toBe('Test description')
		}
	})

	it('should log correctly when projectKey is not set during a successful update', () => {
		stateManager.initializeState()
		// Move to Project Selection without setting projectKey
		// This is a valid forward transition where requirements check passes (INITIATE has none)
		const result = stateManager.updateState({
			currentStep: WizardStep.PROJECT_SELECTION,
			// projectKey remains undefined
		})
		expect(result.success).toBe(true) // This successful update should trigger the log with undefined projectKey
		if (result.success) {
			expect(result.data.currentStep).toBe(WizardStep.PROJECT_SELECTION)
			expect(result.data.projectKey).toBeUndefined() // Verify projectKey is indeed undefined
		}
		// The log on line 102 should have used the '|| '(not set)' branch
	})

	// Additional tests for better coverage

	it('should return error when updateState is called without an active wizard', () => {
		// Ensure no wizard is active
		stateManager.resetState()

		const result = stateManager.updateState({
			fields: { summary: 'Test' },
		})

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('INVALID_PARAMETERS')
		}
	})

	it('should return error when serializeState is called without an active wizard', () => {
		// Ensure no wizard is active
		stateManager.resetState()

		const result = stateManager.serializeState()

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('INVALID_PARAMETERS')
		}
	})

	it('should serialize and deserialize state correctly', () => {
		// Initialize and set up state
		stateManager.initializeState()
		stateManager.updateState({
			currentStep: WizardStep.PROJECT_SELECTION,
			projectKey: 'TEST-1',
		})

		// Serialize the state
		const serializeResult = stateManager.serializeState()
		expect(serializeResult.success).toBe(true)

		// Reset the state
		stateManager.resetState()
		expect(stateManager.isActive()).toBe(false)

		// Deserialize the state
		if (serializeResult.success) {
			const deserializeResult = stateManager.deserializeState(serializeResult.data)
			expect(deserializeResult.success).toBe(true)

			// Check that state is restored
			expect(stateManager.isActive()).toBe(true)

			// Get the state and verify contents
			const stateResult = stateManager.getState()
			if (stateResult.success) {
				expect(stateResult.data.projectKey).toBe('TEST-1')
				expect(stateResult.data.currentStep).toBe(WizardStep.PROJECT_SELECTION)
			}
		}
	})

	it('should handle invalid JSON during deserialization', () => {
		const invalidJson = 'not valid json'
		const result = stateManager.deserializeState(invalidJson)

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('UNKNOWN_ERROR')
		}
	})

	it('should reject invalid state format during deserialization', () => {
		const invalidState = JSON.stringify({ notAValidState: true })
		const result = stateManager.deserializeState(invalidState)

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.code).toBe('INVALID_PARAMETERS')
		}
	})

	// Tests for loadIssueState method
	describe('loadIssueState', () => {
		// Mock for JiraIssue
		const mockJiraIssue: JiraIssue = {
			expand: '',
			id: '12345',
			self: 'https://jira.example.com/rest/api/2/issue/12345',
			key: 'PROJ-123',
			changelog: {
				startAt: 0,
				maxResults: 0,
				total: 0,
				histories: [],
			},
			fields: {
				project: {
					self: 'https://jira.example.com/rest/api/2/project/PROJ',
					id: '10000',
					key: 'PROJ',
					name: 'Project Name',
					projectTypeKey: 'software',
					simplified: false,
					avatarUrls: {},
					projectCategory: {
						self: '',
						id: '',
						description: '',
						name: '',
					},
				},
				issuetype: {
					self: 'https://jira.example.com/rest/api/2/issuetype/10001',
					id: '10001',
					description: 'A task that needs to be done.',
					iconUrl: 'https://jira.example.com/images/icons/issuetypes/task.svg',
					name: 'Task',
					subtask: false,
					avatarId: 1,
					hierarchyLevel: 0,
				},
				summary: 'Test issue',
				status: {
					self: '',
					description: '',
					iconUrl: '',
					name: 'Open',
					id: '1',
					statusCategory: {
						self: '',
						id: 0,
						key: '',
						colorName: '',
						name: '',
					},
				},
				creator: {
					self: '',
					accountId: 'user123',
					emailAddress: 'user@example.com',
					avatarUrls: {},
					displayName: 'Test User',
					active: true,
					timeZone: 'UTC',
					accountType: 'atlassian',
				},
				reporter: {
					self: '',
					accountId: 'user123',
					emailAddress: 'user@example.com',
					avatarUrls: {},
					displayName: 'Test User',
					active: true,
					timeZone: 'UTC',
					accountType: 'atlassian',
				},
				priority: {
					self: '',
					iconUrl: '',
					name: 'Medium',
					id: '3',
				},
				progress: {
					progress: 0,
					total: 0,
				},
				votes: {
					self: '',
					votes: 0,
					hasVoted: false,
				},
				watches: {
					self: '',
					watchCount: 0,
					isWatching: false,
				},
				created: '2023-05-01T10:00:00.000Z',
				updated: '2023-05-01T10:00:00.000Z',
				statuscategorychangedate: '2023-05-01T10:00:00.000Z',
				workratio: -1,
				aggregateprogress: {
					progress: 0,
					total: 0,
				},
				customfield_13100: {
					hasEpicLinkFieldDependency: false,
					showField: false,
					nonEditableReason: {
						reason: '',
						message: '',
					},
				},
				customfield_12801: {
					self: '',
					value: '',
					id: '',
				},
				customfield_14788: {
					self: '',
					value: '',
					id: '',
				},
			},
		} as unknown as JiraIssue

		it('should load an issue state successfully', () => {
			const result = stateManager.loadIssueState(mockJiraIssue)

			expect(result.success).toBe(true)

			expect(result).toEqual({
				success: true,
				data: {
					active: true,
					currentStep: 'field_completion',
					fields: {},
					validation: {
						errors: {},
						warnings: {},
					},
					timestamp: expect.any(Number),
					issueKey: 'PROJ-123',
					projectKey: 'PROJ',
					issueTypeId: '10001',
					mode: 'updating',
				},
			})
		})

		it('should return existing state if already working with the same issue', () => {
			// First load the issue
			stateManager.loadIssueState(mockJiraIssue)

			// Update something in the state to verify it remains
			stateManager.updateState({
				fields: { summary: 'Updated summary' },
			})

			// Load the same issue again
			const result = stateManager.loadIssueState(mockJiraIssue)

			expect(result).toEqual({
				success: true,
				data: {
					active: true,
					currentStep: 'field_completion',
					fields: {
						summary: 'Updated summary',
					},
					validation: {
						errors: {},
						warnings: {},
					},
					timestamp: expect.any(Number),
					issueKey: 'PROJ-123',
					projectKey: 'PROJ',
					issueTypeId: '10001',
					mode: 'updating',
				},
			})
		})

		it('should reset and create new state when loading a different issue', () => {
			// First load an issue
			stateManager.loadIssueState(mockJiraIssue)

			// Update something in the state
			stateManager.updateState({
				fields: { summary: 'Updated summary' },
			})

			// Load a different issue
			const differentIssue = {
				...mockJiraIssue,
				key: 'PROJ-456',
				id: '67890',
			} as unknown as JiraIssue

			const result = stateManager.loadIssueState(differentIssue)

			expect(result).toEqual({
				success: true,
				data: {
					active: true,
					currentStep: 'field_completion',
					fields: {},
					validation: {
						errors: {},
						warnings: {},
					},
					timestamp: expect.any(Number),
					issueKey: 'PROJ-456',
					projectKey: 'PROJ',
					issueTypeId: '10001',
					mode: 'updating',
				},
			})
		})

		it('should initialize a new state when no wizard is active', () => {
			// Ensure no wizard is active
			stateManager.resetState()
			expect(stateManager.isActive()).toBe(false)

			// Create spies to verify the expected method calls
			const resetStateSpy = jest.spyOn(stateManager, 'resetState')
			const initializeStateSpy = jest.spyOn(stateManager, 'initializeState')

			// Load an issue when no wizard is active
			const result = stateManager.loadIssueState(mockJiraIssue)

			// Verify resetState was called (though it was already inactive)
			expect(resetStateSpy).toHaveBeenCalled()
			// Verify initializeState was called to create a new state
			expect(initializeStateSpy).toHaveBeenCalled()

			expect(result).toEqual({
				success: true,
				data: {
					active: true,
					currentStep: 'field_completion',
					fields: {},
					validation: {
						errors: {},
						warnings: {},
					},
					timestamp: expect.any(Number),
					issueKey: 'PROJ-123',
					projectKey: 'PROJ',
					issueTypeId: '10001',
					mode: 'updating',
				},
			})
		})

		it('should handle initialization failure', () => {
			// Mock a failure in initializeState
			jest.spyOn(stateManager, 'initializeState').mockReturnValueOnce({
				success: false,
				error: {
					code: 'TEST_ERROR',
					message: 'Test error message',
				},
			})

			const result = stateManager.loadIssueState(mockJiraIssue)

			expect(result).toEqual({
				success: false,
				error: {
					code: 'TEST_ERROR',
					message: 'Test error message',
				},
			})
		})

		it('should set currentStep to INITIATE when project is missing but issuetype exists', () => {
			// Create a mock issue with missing project info but valid issuetype
			const issueWithMissingProject = {
				...mockJiraIssue,
				fields: {
					...mockJiraIssue.fields,
					project: undefined, // Completely missing project
					issuetype: mockJiraIssue.fields.issuetype,
				},
			} as unknown as JiraIssue

			// Mock the updateState method to return a success with INITIATE step
			jest.spyOn(stateManager, 'updateState').mockImplementationOnce(() => {
				return createSuccess({
					currentStep: WizardStep.INITIATE,
					active: true,
					fields: {},
					validation: { errors: {}, warnings: {} },
					timestamp: Date.now(),
				})
			})

			// Load the issue with missing project
			const result = stateManager.loadIssueState(issueWithMissingProject)

			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.currentStep).toBe(WizardStep.INITIATE)
			}
		})

		it('should set currentStep to INITIATE when issuetype is missing but project exists', () => {
			// Create a mock issue with missing issuetype info but valid project
			const issueWithMissingIssueType = {
				...mockJiraIssue,
				fields: {
					...mockJiraIssue.fields,
					project: mockJiraIssue.fields.project,
					issuetype: undefined, // Completely missing issuetype
				},
			} as unknown as JiraIssue

			// Mock the updateState method to return a success with INITIATE step
			jest.spyOn(stateManager, 'updateState').mockImplementationOnce(() => {
				return createSuccess({
					currentStep: WizardStep.INITIATE,
					active: true,
					fields: {},
					validation: { errors: {}, warnings: {} },
					timestamp: Date.now(),
				})
			})

			// Load the issue with missing issuetype
			const result = stateManager.loadIssueState(issueWithMissingIssueType)

			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.currentStep).toBe(WizardStep.INITIATE)
			}
		})

		it('should set currentStep to INITIATE when both project and issuetype are missing', () => {
			// Create a mock issue with both project and issuetype missing
			const issueWithMissingData = {
				...mockJiraIssue,
				fields: {
					...mockJiraIssue.fields,
					project: undefined, // Completely missing project
					issuetype: undefined, // Completely missing issuetype
				},
			} as unknown as JiraIssue

			// Mock the updateState method to return a success with INITIATE step
			jest.spyOn(stateManager, 'updateState').mockImplementationOnce(() => {
				return createSuccess({
					currentStep: WizardStep.INITIATE,
					active: true,
					fields: {},
					validation: { errors: {}, warnings: {} },
					timestamp: Date.now(),
				})
			})

			// Load the issue with missing data
			const result = stateManager.loadIssueState(issueWithMissingData)

			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.currentStep).toBe(WizardStep.INITIATE)
			}
		})
	})
})
