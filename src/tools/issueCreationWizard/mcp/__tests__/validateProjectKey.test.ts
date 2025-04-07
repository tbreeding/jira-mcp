/**
 * Unit tests for the validateProjectKey function.
 */

import { WizardStep } from '../../types'
import { validateProjectKey } from '../validateProjectKey'
import { getProjectByKey } from '../../../../jira/api/getProjects'
import type { JiraApiConfig } from '../../../../jira/api/apiTypes'

// Mock the getProjectByKey API function
jest.mock('../../../../jira/api/getProjects')

// Mock logger
jest.mock('../../../../utils/logger', () => ({
	log: jest.fn(),
}))

describe('validateProjectKey', () => {
	const mockConfig: JiraApiConfig = {
		baseUrl: 'https://test.jira.com',
		username: 'test',
		apiToken: 'token',
	}

	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('should return null if step is not PROJECT_SELECTION', async () => {
		const result = await validateProjectKey('TEST', WizardStep.INITIATE, mockConfig)
		expect(result).toBeNull()
		expect(getProjectByKey).not.toHaveBeenCalled()
	})

	test('should return null if jiraConfig is not provided', async () => {
		const result = await validateProjectKey('TEST', WizardStep.PROJECT_SELECTION, undefined)
		expect(result).toBeNull()
		expect(getProjectByKey).not.toHaveBeenCalled()
	})

	test('should return null if projectKey is empty', async () => {
		const result = await validateProjectKey('', WizardStep.PROJECT_SELECTION, mockConfig)
		expect(result).toBeNull()
		expect(getProjectByKey).not.toHaveBeenCalled()
	})

	test('should return error message if project validation fails', async () => {
		const projectKey = 'INVALID'
		const errorMessage = 'Project not found'
		;(getProjectByKey as jest.Mock).mockResolvedValue({
			success: false,
			error: { message: errorMessage },
		})

		const result = await validateProjectKey(projectKey, WizardStep.PROJECT_SELECTION, mockConfig)

		expect(getProjectByKey).toHaveBeenCalledWith(projectKey, mockConfig)
		expect(result).toBe(`Invalid project key: ${projectKey}. ${errorMessage}`)
	})

	test('should return null if project validation succeeds', async () => {
		const projectKey = 'VALID'
		;(getProjectByKey as jest.Mock).mockResolvedValue({
			success: true,
			value: { id: '10001', key: projectKey, name: 'Valid Project' },
		})

		const result = await validateProjectKey(projectKey, WizardStep.PROJECT_SELECTION, mockConfig)

		expect(getProjectByKey).toHaveBeenCalledWith(projectKey, mockConfig)
		expect(result).toBeNull()
	})
})
