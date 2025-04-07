import * as findApprovalDependencies from '../extractors/findApprovalDependencies'
import * as findExternalSystems from '../extractors/findExternalSystems'
import * as findTeamDependencies from '../extractors/findTeamDependencies'
import { identifyExternalDependencies, collectAllExternalDependencies } from '../identifyExternalDependencies'
import type { IssueCommentResponse, IssueComment } from '../../../../../types/comment'
import type { JiraIssue } from '../../../../../types/issue.types'

jest.mock('../extractors/findExternalSystems')
jest.mock('../extractors/findTeamDependencies')
jest.mock('../extractors/findApprovalDependencies')

describe('identifyExternalDependencies', () => {
	beforeEach(() => {
		jest.clearAllMocks()

		// Setup default mocks
		jest.spyOn(findExternalSystems, 'findExternalSystems').mockReturnValue([])
		jest.spyOn(findTeamDependencies, 'findTeamDependencies').mockReturnValue([])
		jest.spyOn(findApprovalDependencies, 'findApprovalDependencies').mockReturnValue([])
	})

	it('should return empty array if issue or comments are missing', () => {
		const result1 = identifyExternalDependencies(undefined as unknown as JiraIssue, {} as IssueCommentResponse)
		const result2 = identifyExternalDependencies({} as JiraIssue, undefined as unknown as IssueCommentResponse)

		expect(result1).toEqual([])
		expect(result2).toEqual([])
	})

	it('should combine text from description and comments', () => {
		const mockIssue = {
			key: 'TEST-123',
			fields: {
				summary: 'Test issue',
				description: 'This needs approval from security team',
			},
		} as unknown as JiraIssue

		const mockComments: IssueCommentResponse = {
			comments: [
				{
					id: '1',
					body: {
						type: 'doc',
						version: 1,
						content: [
							{
								type: 'paragraph',
								content: [
									{
										type: 'text',
										text: 'This also depends on the auth service',
									},
								],
							},
						],
					},
					created: new Date('2023-01-01'),
					updated: new Date('2023-01-01'),
					self: 'http://jira/1',
					jsdPublic: true,
				} as unknown as IssueComment,
			],
			startAt: 0,
			maxResults: 10,
			total: 1,
		}

		// Setup mocks with expected values
		jest.spyOn(findExternalSystems, 'findExternalSystems').mockReturnValue(['auth service'])
		jest.spyOn(findTeamDependencies, 'findTeamDependencies').mockReturnValue(['security team'])

		const result = identifyExternalDependencies(mockIssue, mockComments)

		expect(result).toContainEqual('System: auth service')
		expect(result).toContainEqual('Team: security team')
	})
})

describe('collectAllExternalDependencies', () => {
	beforeEach(() => {
		jest.clearAllMocks()

		// Setup default mocks
		jest.spyOn(findExternalSystems, 'findExternalSystems').mockReturnValue([])
		jest.spyOn(findTeamDependencies, 'findTeamDependencies').mockReturnValue([])
		jest.spyOn(findApprovalDependencies, 'findApprovalDependencies').mockReturnValue([])
	})

	it('should return empty array if text is empty', () => {
		const result = collectAllExternalDependencies('')
		expect(result).toEqual([])
	})

	it('should collect external systems with appropriate prefix', () => {
		jest.spyOn(findExternalSystems, 'findExternalSystems').mockReturnValue(['auth service', 'payment API'])

		const result = collectAllExternalDependencies('some text')

		expect(result).toContainEqual('System: auth service')
		expect(result).toContainEqual('System: payment API')
	})

	it('should collect team dependencies with appropriate prefix', () => {
		jest.spyOn(findTeamDependencies, 'findTeamDependencies').mockReturnValue(['security team', 'QA team'])

		const result = collectAllExternalDependencies('some text')

		expect(result).toContainEqual('Team: security team')
		expect(result).toContainEqual('Team: QA team')
	})

	it('should collect approval dependencies with appropriate prefix', () => {
		jest
			.spyOn(findApprovalDependencies, 'findApprovalDependencies')
			.mockReturnValue(['security approval', 'management sign-off'])

		const result = collectAllExternalDependencies('some text')

		expect(result).toContainEqual('Approval: security approval')
		expect(result).toContainEqual('Approval: management sign-off')
	})

	it('should combine all types of dependencies', () => {
		jest.spyOn(findExternalSystems, 'findExternalSystems').mockReturnValue(['auth service'])
		jest.spyOn(findTeamDependencies, 'findTeamDependencies').mockReturnValue(['security team'])
		jest.spyOn(findApprovalDependencies, 'findApprovalDependencies').mockReturnValue(['management sign-off'])

		const result = collectAllExternalDependencies('some text')

		expect(result).toHaveLength(3)
		expect(result).toContainEqual('System: auth service')
		expect(result).toContainEqual('Team: security team')
		expect(result).toContainEqual('Approval: management sign-off')
	})
})
