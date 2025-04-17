import { getFieldsWizardToolExecutor } from '../getFieldsExecutor'
import * as utils from '../utils'
import * as wizardStateHelpers from '../wizardStateHelpers'
import * as projectsApi from '../../../../jira/api/getProjects'
import * as categorizeFields from '../../../../jira/api/getAndCategorizeFields'
import * as cache from '../hasCachedFieldMetadata'

jest.mock('../utils')
jest.mock('../wizardStateHelpers')
jest.mock('../../../../jira/api/getProjects')
jest.mock('../../../../jira/api/getAndCategorizeFields')
jest.mock('../hasCachedFieldMetadata')

const mockStateManager = { getState: jest.fn() } as any
const mockConfig = { baseUrl: '', username: '', apiToken: '' }

const setMock = (overrides: Partial<any> = {}) => {
	;(mockStateManager.getState as jest.Mock).mockResolvedValue(overrides.state || {})
	;(wizardStateHelpers.checkWizardState as jest.Mock).mockResolvedValue(overrides.checkResult)
	;(projectsApi.getProjectByKey as jest.Mock).mockResolvedValue(overrides.projectResult)
	;(categorizeFields.getAndCategorizeFields as jest.Mock).mockResolvedValue(overrides.fieldsResult)
	;(utils.createSuccessResult as jest.Mock).mockReturnValue(overrides.successResult)
	;(utils.createErrorResult as jest.Mock).mockReturnValue(overrides.errorResult)
}

describe('getFieldsWizardToolExecutor', () => {
	beforeEach(() => jest.clearAllMocks())

	it('returns cached metadata if present and not forceRefresh', async () => {
		;(cache.hasCachedFieldMetadata as jest.Mock).mockReturnValue(true)
		setMock({
			state: { success: true, data: { analysis: { metadata: { foo: 'bar' } } } },
			successResult: { ok: true },
		})
		const result = await getFieldsWizardToolExecutor(mockStateManager, mockConfig)({ arguments: {} })
		expect(result).toEqual({ ok: true })
		expect(utils.createSuccessResult).toHaveBeenCalledWith({
			success: true,
			message: expect.stringContaining('cache'),
			fields: { foo: 'bar' },
			cached: true,
		})
	})

	it('returns error if checkWizardState fails', async () => {
		setMock({
			checkResult: { success: false, errorMessage: 'fail' },
			errorResult: { err: true },
		})
		const result = await getFieldsWizardToolExecutor(
			mockStateManager,
			mockConfig,
		)({ arguments: { forceRefresh: true } })
		expect(result).toEqual({ err: true })
		expect(utils.createErrorResult).toHaveBeenCalledWith('fail')
	})

	it('returns error if projectKey or issueTypeId missing', async () => {
		setMock({
			checkResult: { success: true, projectKey: undefined, issueTypeId: 'x' },
			errorResult: { err: 1 },
		})
		const result = await getFieldsWizardToolExecutor(
			mockStateManager,
			mockConfig,
		)({ arguments: { forceRefresh: true } })
		expect(result).toEqual({ err: 1 })
		setMock({
			checkResult: { success: true, projectKey: 'x', issueTypeId: undefined },
			errorResult: { err: 2 },
		})
		const result2 = await getFieldsWizardToolExecutor(
			mockStateManager,
			mockConfig,
		)({ arguments: { forceRefresh: true } })
		expect(result2).toEqual({ err: 2 })
	})

	it('returns error if getProjectByKey fails', async () => {
		setMock({
			checkResult: { success: true, projectKey: 'p', issueTypeId: 'i' },
			projectResult: { success: false, error: { message: 'no project' } },
			errorResult: { err: 3 },
		})
		const result = await getFieldsWizardToolExecutor(
			mockStateManager,
			mockConfig,
		)({ arguments: { forceRefresh: true } })
		expect(result).toEqual({ err: 3 })
		expect(utils.createErrorResult).toHaveBeenCalledWith('Failed to retrieve project information: no project')
	})

	it('returns error if getAndCategorizeFields fails', async () => {
		setMock({
			checkResult: { success: true, projectKey: 'p', issueTypeId: 'i' },
			projectResult: { success: true, value: { id: 'pid' } },
			fieldsResult: { success: false, error: { message: 'no fields' } },
			errorResult: { err: 4 },
		})
		const result = await getFieldsWizardToolExecutor(
			mockStateManager,
			mockConfig,
		)({ arguments: { forceRefresh: true } })
		expect(result).toEqual({ err: 4 })
		expect(utils.createErrorResult).toHaveBeenCalledWith('Failed to retrieve fields: no fields')
	})

	it('returns success if all steps succeed', async () => {
		setMock({
			checkResult: { success: true, projectKey: 'p', issueTypeId: 'i' },
			projectResult: { success: true, value: { id: 'pid' } },
			fieldsResult: { success: true, value: { foo: 'bar' } },
			successResult: { ok: 2 },
		})
		const result = await getFieldsWizardToolExecutor(
			mockStateManager,
			mockConfig,
		)({ arguments: { forceRefresh: true } })
		expect(result).toEqual({ ok: 2 })
		expect(utils.createSuccessResult).toHaveBeenCalledWith({
			success: true,
			message: 'Fields retrieved successfully',
			fields: { foo: 'bar' },
		})
	})

	it('returns error if exception thrown', async () => {
		;(cache.hasCachedFieldMetadata as jest.Mock).mockReturnValue(false)
		;(mockStateManager.getState as jest.Mock).mockImplementationOnce(() => {
			throw new Error('fail')
		})
		;(utils.createErrorResult as jest.Mock).mockReturnValue({ err: 5 })
		const result = await getFieldsWizardToolExecutor(
			mockStateManager,
			mockConfig,
		)({ arguments: { forceRefresh: true } })
		expect(result).toEqual({ err: 5 })
		expect(utils.createErrorResult).toHaveBeenCalledWith('Unexpected error: fail')
	})
})
