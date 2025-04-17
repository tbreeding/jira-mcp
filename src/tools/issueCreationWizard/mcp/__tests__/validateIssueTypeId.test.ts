/**
 * Unit tests for validateIssueTypeId
 */

import { validateIssueTypeId } from '../validateIssueTypeId'
import { WizardStep } from '../../types'
import type { WizardState } from '../../types'
import type { JiraApiConfig } from '../../../../jira/api/apiTypes'

// Mock the getIssueTypeById dependency
jest.mock('../../../../jira/api/getIssueTypeById', () => ({
	getIssueTypeById: jest.fn(),
}))

// Import the mocked function for manipulation in tests
import { getIssueTypeById } from '../../../../jira/api/getIssueTypeById'
import type { JiraIssueType } from '../../../../jira/types/issueType.types'

describe('validateIssueTypeId', () => {
	const mockedGetIssueTypeById = getIssueTypeById as jest.MockedFunction<typeof getIssueTypeById>

	const baseState: WizardState = {
		active: true,
		currentStep: WizardStep.ISSUE_TYPE_SELECTION,
		projectKey: 'TEST',
		fields: {},
		validation: {
			errors: {},
			warnings: {},
		},
		timestamp: Date.now(),
	}

	const jiraConfig: JiraApiConfig = {
		baseUrl: 'https://jira.example.com',
		username: 'test-username',
		apiToken: 'test-api-token',
	}

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return null when issueTypeId is falsy', async () => {
		const result = await validateIssueTypeId('', WizardStep.ISSUE_TYPE_SELECTION, 'TEST', baseState, jiraConfig)
		expect(result).toBeNull()
		expect(mockedGetIssueTypeById).not.toHaveBeenCalled()
	})

	it('should return null when jiraConfig is undefined', async () => {
		const result = await validateIssueTypeId('10001', WizardStep.ISSUE_TYPE_SELECTION, 'TEST', baseState, undefined)
		expect(result).toBeNull()
		expect(mockedGetIssueTypeById).not.toHaveBeenCalled()
	})

	it('should return null when step is not ISSUE_TYPE_SELECTION', async () => {
		const result = await validateIssueTypeId('10001', WizardStep.INITIATE, 'TEST', baseState, jiraConfig)
		expect(result).toBeNull()
		expect(mockedGetIssueTypeById).not.toHaveBeenCalled()
	})

	it('should return error when projectKey and currentState.projectKey are both undefined', async () => {
		const stateWithoutProject = { ...baseState, projectKey: undefined }

		const result = await validateIssueTypeId(
			'10001',
			WizardStep.ISSUE_TYPE_SELECTION,
			undefined,
			stateWithoutProject,
			jiraConfig,
		)

		expect(result).toBe('Cannot validate issue type: No project key available')
		expect(mockedGetIssueTypeById).not.toHaveBeenCalled()
	})

	it('should return error message when getIssueTypeById fails', async () => {
		mockedGetIssueTypeById.mockResolvedValue({
			success: false,
			error: {
				name: 'Error',
				message: 'Issue type not found',
			},
		})

		const result = await validateIssueTypeId('10001', WizardStep.ISSUE_TYPE_SELECTION, 'TEST', baseState, jiraConfig)

		expect(result).toContain('Invalid issue type ID')
		expect(result).toContain('Issue type not found')
		expect(mockedGetIssueTypeById).toHaveBeenCalledWith('TEST', '10001', jiraConfig)
	})

	it('should return null when getIssueTypeById succeeds', async () => {
		mockedGetIssueTypeById.mockResolvedValue({
			success: true,
			value: {
				id: '10001',
				name: 'Bug',
				iconUrl: 'https://example.com/bug.svg',
			} as unknown as JiraIssueType,
		})

		const result = await validateIssueTypeId('10001', WizardStep.ISSUE_TYPE_SELECTION, 'TEST', baseState, jiraConfig)

		expect(result).toBeNull()
		expect(mockedGetIssueTypeById).toHaveBeenCalledWith('TEST', '10001', jiraConfig)
	})

	it('should use currentState.projectKey when projectKey parameter is undefined', async () => {
		mockedGetIssueTypeById.mockResolvedValue({
			success: true,
			value: {
				id: '10001',
				name: 'Bug',
				iconUrl: 'https://example.com/bug.svg',
			} as unknown as JiraIssueType,
		})

		const result = await validateIssueTypeId('10001', WizardStep.ISSUE_TYPE_SELECTION, undefined, baseState, jiraConfig)

		expect(result).toBeNull()
		expect(mockedGetIssueTypeById).toHaveBeenCalledWith('TEST', '10001', jiraConfig)
	})
})
