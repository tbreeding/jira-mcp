/**
 * Tests for issueMapper function
 */
import { mapIssueToEssentialFields } from '../issueMapper'
import { extractSprints, getNamedProperty, extractParent } from '../jiraFieldExtractors'

// Mock dependencies
jest.mock('../jiraFieldExtractors')

// Mock types
const mockGetNamedProperty = getNamedProperty as jest.MockedFunction<typeof getNamedProperty>
const mockExtractSprints = extractSprints as jest.MockedFunction<typeof extractSprints>
const mockExtractParent = extractParent as jest.MockedFunction<typeof extractParent>

describe('issueMapper', () => {
	beforeEach(() => {
		jest.clearAllMocks()

		// Setup default mock behavior
		mockGetNamedProperty.mockImplementation((obj, prop) => `mock-${prop}`)
		mockExtractSprints.mockReturnValue(['Sprint 1'])
		mockExtractParent.mockReturnValue(undefined)
	})

	describe('mapIssueToEssentialFields', () => {
		test('should map issue to essential fields', () => {
			// Arrange
			const issue = {
				id: 'ISSUE-123',
				key: 'PROJ-123',
				fields: {
					summary: 'Test Issue',
					status: { name: 'Open' },
					issuetype: { name: 'Bug' },
					priority: { name: 'High' },
					assignee: { displayName: 'John Doe' },
					reporter: { displayName: 'Jane Smith' },
					created: '2023-01-01T12:00:00.000Z',
					updated: '2023-01-02T12:00:00.000Z',
				},
			}

			mockGetNamedProperty
				.mockReturnValueOnce('Open') // status
				.mockReturnValueOnce('Bug') // issueType
				.mockReturnValueOnce('High') // priority
				.mockReturnValueOnce('John Doe') // assignee
				.mockReturnValueOnce('Jane Smith') // reporter

			// Act
			const result = mapIssueToEssentialFields(issue)

			// Assert
			expect(result).toEqual({
				id: 'ISSUE-123',
				key: 'PROJ-123',
				summary: 'Test Issue',
				status: 'Open',
				issueType: 'Bug',
				priority: 'High',
				assignee: 'John Doe',
				reporter: 'Jane Smith',
				created: '2023-01-01T12:00:00.000Z',
				updated: '2023-01-02T12:00:00.000Z',
				sprints: ['Sprint 1'],
			})

			expect(mockGetNamedProperty).toHaveBeenCalledWith(issue.fields.status, 'name')
			expect(mockGetNamedProperty).toHaveBeenCalledWith(issue.fields.issuetype, 'name')
			expect(mockGetNamedProperty).toHaveBeenCalledWith(issue.fields.priority, 'name')
			expect(mockGetNamedProperty).toHaveBeenCalledWith(issue.fields.assignee, 'displayName')
			expect(mockGetNamedProperty).toHaveBeenCalledWith(issue.fields.reporter, 'displayName')
			expect(mockExtractSprints).toHaveBeenCalledWith(issue.fields)
			expect(mockExtractParent).toHaveBeenCalledWith(issue.fields)
		})

		test('should include parent when present', () => {
			// Arrange
			const issue = {
				id: 'ISSUE-123',
				key: 'PROJ-123',
				fields: {
					summary: 'Test Issue',
					status: { name: 'Open' },
					issuetype: { name: 'Sub-task' },
					priority: { name: 'High' },
					assignee: { displayName: 'John Doe' },
					reporter: { displayName: 'Jane Smith' },
					created: '2023-01-01T12:00:00.000Z',
					updated: '2023-01-02T12:00:00.000Z',
				},
			}

			const parent = {
				key: 'PROJ-100',
				summary: 'Parent Issue',
			}

			mockExtractParent.mockReturnValue(parent)

			// Act
			const result = mapIssueToEssentialFields(issue)

			// Assert
			expect(result.parent).toEqual(parent)
		})

		test('should handle missing fields gracefully', () => {
			// Arrange
			const issue = {
				id: 'ISSUE-123',
				key: 'PROJ-123',
				fields: {
					summary: 'Test Issue',
				},
			}

			mockGetNamedProperty.mockReturnValue('') // Return empty string for all calls

			mockExtractSprints.mockReturnValue([])

			// Act
			const result = mapIssueToEssentialFields(issue)

			// Assert
			expect(result).toEqual({
				id: 'ISSUE-123',
				key: 'PROJ-123',
				summary: 'Test Issue',
				status: '',
				issueType: '',
				priority: '',
				assignee: '',
				reporter: '',
				created: undefined,
				updated: undefined,
				sprints: [],
			})
		})

		test('should handle missing fields object', () => {
			// Arrange
			const issue = {
				id: 'ISSUE-123',
				key: 'PROJ-123',
			}

			// Act
			const result = mapIssueToEssentialFields(issue)

			// Assert
			expect(result.id).toBe('ISSUE-123')
			expect(result.key).toBe('PROJ-123')
			expect(result.summary).toBeUndefined()
		})
	})
})
