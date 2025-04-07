import { Failure, Success } from '../../../../utils/try'
import generateChangeLogsForIssue from '../generateChangeLogsForIssue'

jest.mock('../generateChangeLogsForIssue')
const mockGenerateChangeLogsForIssue = generateChangeLogsForIssue as unknown as jest.Mock
describe('repositories/jiraApi/issueChangeLogs/getAllChangeLogsForIssue', function () {
	it('yields a Failure and returns when the jira api returns an error', async function () {
		const getAllChangeLogsForIssue = jest.requireActual('../getAllChangeLogsForIssue').default

		const mockError = new Error('error')
		mockGenerateChangeLogsForIssue.mockImplementationOnce(
			jest.fn(function* () {
				yield Failure(mockError)
			}),
		)

		const results = await getAllChangeLogsForIssue('doestNotMatter')

		expect(results.error.message).toBe(mockError.message)
	})

	it('returns a success with all generated values if the generator never returns a Failure', async function () {
		const getAllChangeLogsForIssue = jest.requireActual('../getAllChangeLogsForIssue').default
		mockGenerateChangeLogsForIssue.mockImplementationOnce(function* () {
			yield Success('value1')
			yield Success('value2')
		})

		const results = await getAllChangeLogsForIssue(12345)
		expect(results.error).toBeUndefined()
		expect(results.value).toEqual(['value1', 'value2'])
	})
})
