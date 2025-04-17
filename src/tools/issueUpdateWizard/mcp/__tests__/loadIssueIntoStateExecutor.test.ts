import { loadIssueIntoStateExecutor } from '../loadIssueIntoStateExecutor'

const mockGetIssueByKey = jest.fn()
jest.mock('../../../../jira/api/getIssue', () => ({
	getIssueByKey: (...args: unknown[]) => mockGetIssueByKey(...args),
}))

describe('loadIssueIntoStateExecutor', () => {
	const mockStateManager = {
		loadIssueState: jest.fn(),
	} as any
	const mockJiraConfig = {} as any
	const executor = loadIssueIntoStateExecutor(mockStateManager, mockJiraConfig)

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('returns error if issueKey is missing', async () => {
		const result = await executor({ arguments: {} })
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toContain('issueKey is required')
		expect(JSON.parse(result.content[0].text)).toEqual(expect.objectContaining({ success: false }))
	})

	it('returns error if getIssueByKey returns error', async () => {
		mockGetIssueByKey.mockResolvedValueOnce({ error: { message: 'API error' } })
		const result = await executor({ arguments: { issueKey: 'KEY-1' } })
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toContain('API error')
		expect(JSON.parse(result.content[0].text)).toEqual(expect.objectContaining({ success: false }))
	})

	it('returns error if stateManager.loadIssueState returns unsuccessful result', async () => {
		mockGetIssueByKey.mockResolvedValueOnce({ error: undefined, value: { key: 'KEY-1' } })
		mockStateManager.loadIssueState.mockReturnValueOnce({
			success: false,
			error: { code: 'STATE_FAIL', message: 'State error' },
		})
		const result = await executor({ arguments: { issueKey: 'KEY-1' } })
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toContain('State error')
		expect(JSON.parse(result.content[0].text)).toEqual(expect.objectContaining({ success: false }))
	})

	it('returns success and state if all is well', async () => {
		const state = { key: 'KEY-1', fields: {} }
		mockGetIssueByKey.mockResolvedValueOnce({ error: undefined, value: { key: 'KEY-1' } })
		mockStateManager.loadIssueState.mockReturnValueOnce({ success: true, data: state })
		const result = await executor({ arguments: { issueKey: 'KEY-1' } })
		expect(result.isError).toBe(false)
		const parsed = JSON.parse(result.content[0].text)
		expect(parsed).toEqual({ success: true, state })
	})
})
