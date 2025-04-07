import { Failure, Success } from '../../../../utils/try'
import createGetIssueChangeLogs from '../createGetIssueChangeLogs'

jest.mock('../createGetIssueChangeLogs')
const mockCreateGetIssueChangeLogs = createGetIssueChangeLogs as unknown as jest.Mock

describe('repositories/jiraApi/issueChangeLogs/generateChangeLogsForIssue', function () {
	it('yields a failure and then returns when the jira api returns an error', async function () {
		const generateChangeLogsForIssue = jest.requireActual('../generateChangeLogsForIssue').default

		const mockError = new Error('error')
		mockCreateGetIssueChangeLogs.mockImplementationOnce(
			jest.fn(function () {
				return function () {
					return Failure(mockError)
				}
			}),
		)

		const generator = generateChangeLogsForIssue('doesNotMatter')
		const results = await generator.next()
		expect(results.value.error.message).toBe(mockError.message)

		const finalResults = await generator.next()
		expect(finalResults.value).toBeUndefined()
		expect(finalResults.done).toBe(true)
	})

	it('yields a success with each individual value returned from the jira api', async function () {
		const generateChangeLogsForIssue = jest.requireActual('../generateChangeLogsForIssue').default

		const mockJiraValue = 'doesNotMatter'
		mockCreateGetIssueChangeLogs.mockImplementationOnce(
			jest.fn(function () {
				function* mockJiraApi() {
					yield { startAt: 0, values: [mockJiraValue], isLast: false }
				}

				const jiraApiGenerator = mockJiraApi()
				return function () {
					const { value } = jiraApiGenerator.next()

					return Success(value)
				}
			}),
		)

		const generator = generateChangeLogsForIssue('doesNotMatter')
		const results = await generator.next()
		expect(results.value.value).toBe(mockJiraValue)
	})

	it('yields successes until the jira api returns its last page of values', async function () {
		const generateChangeLogsForIssue = jest.requireActual('../generateChangeLogsForIssue').default

		const mockJiraValue1 = 'doesNotMatter1'
		const mockJiraValue2 = 'doesNotMatter2'
		mockCreateGetIssueChangeLogs.mockImplementationOnce(
			jest.fn(function () {
				function* mockJiraApi() {
					yield { startAt: 0, values: [mockJiraValue1], isLast: false }
					yield { startAt: 0, values: [mockJiraValue2], isLast: true }
				}

				const jiraApiGenerator = mockJiraApi()
				return function () {
					const { value } = jiraApiGenerator.next()

					return Success(value)
				}
			}),
		)

		const generator = generateChangeLogsForIssue('doesNotMatter')

		const results1 = await generator.next()
		expect(results1.value.value).toBe(mockJiraValue1)

		const results2 = await generator.next()
		expect(results2.value.value).toBe(mockJiraValue2)

		const finalResults = await generator.next()
		expect(finalResults.value).toBeUndefined()
		expect(finalResults.done).toBe(true)
	})

	it('stops generating when the jira api returns no values', async function () {
		const generateChangeLogsForIssue = jest.requireActual('../generateChangeLogsForIssue').default

		mockCreateGetIssueChangeLogs.mockImplementationOnce(
			jest.fn(function () {
				function* mockJiraApi() {
					yield { startAt: 0, values: undefined, isLast: false }
				}

				const jiraApiGenerator = mockJiraApi()
				return function () {
					const { value } = jiraApiGenerator.next()

					return Success(value)
				}
			}),
		)

		const generator = generateChangeLogsForIssue('doesNotMatter')

		const results = await generator.next()
		expect(results.done).toBe(true)
		expect(results.value).toBeUndefined()
	})

	it('stops generating when the jira api returns an empty array of values', async function () {
		const generateChangeLogsForIssue = jest.requireActual('../generateChangeLogsForIssue').default

		mockCreateGetIssueChangeLogs.mockImplementationOnce(
			jest.fn(function () {
				function* mockJiraApi() {
					yield { startAt: 0, values: [], isLast: false }
				}

				const jiraApiGenerator = mockJiraApi()
				return function () {
					const { value } = jiraApiGenerator.next()

					return Success(value)
				}
			}),
		)

		const generator = generateChangeLogsForIssue('doesNotMatter')

		const results = await generator.next()
		expect(results.done).toBe(true)
		expect(results.value).toBeUndefined()
	})
})
