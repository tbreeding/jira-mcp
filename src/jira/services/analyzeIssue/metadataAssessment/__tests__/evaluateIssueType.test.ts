import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'

// Mock dependencies before importing
jest.mock('../containsBugIndicators', () => ({
	containsBugIndicators: jest.fn(),
}))

jest.mock('../containsFeatureIndicators', () => ({
	containsFeatureIndicators: jest.fn(),
}))

jest.mock('../containsTaskIndicators', () => ({
	containsTaskIndicators: jest.fn(),
}))

jest.mock('../determineSuggestedIssueType', () => ({
	determineSuggestedIssueType: jest.fn(),
}))

jest.mock('../extractAllText', () => ({
	extractAllText: jest.fn(),
}))

// Import the tested function and mocked modules
import { containsBugIndicators } from '../containsBugIndicators'
import { containsFeatureIndicators } from '../containsFeatureIndicators'
import { containsTaskIndicators } from '../containsTaskIndicators'
import { determineSuggestedIssueType } from '../determineSuggestedIssueType'
import { evaluateIssueType } from '../evaluateIssueType'
import { extractAllText } from '../extractAllText'

// Get the mock functions
const mockExtractAllText = extractAllText as jest.Mock
const mockContainsBugIndicators = containsBugIndicators as jest.Mock
const mockContainsFeatureIndicators = containsFeatureIndicators as jest.Mock
const mockContainsTaskIndicators = containsTaskIndicators as jest.Mock
const mockDetermineSuggestedIssueType = determineSuggestedIssueType as jest.Mock

describe('evaluateIssueType', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should evaluate issue type correctly when type matches content', () => {
		// Mock return values
		mockExtractAllText.mockReturnValue('This is a bug in the login process')
		mockContainsBugIndicators.mockReturnValue(true)
		mockContainsFeatureIndicators.mockReturnValue(false)
		mockContainsTaskIndicators.mockReturnValue(false)
		mockDetermineSuggestedIssueType.mockReturnValue('Bug')

		// Mock input data
		const mockIssue = {
			fields: {
				issuetype: {
					name: 'Bug',
				},
			},
		} as unknown as JiraIssue

		const mockComments = {} as IssueCommentResponse

		// Call the function
		const result = evaluateIssueType(mockIssue, mockComments)

		// Verify all functions were called with correct parameters
		expect(mockExtractAllText).toHaveBeenCalledWith(mockIssue, mockComments)
		expect(mockContainsBugIndicators).toHaveBeenCalledWith('This is a bug in the login process')
		expect(mockContainsFeatureIndicators).toHaveBeenCalledWith('This is a bug in the login process')
		expect(mockContainsTaskIndicators).toHaveBeenCalledWith('This is a bug in the login process')
		expect(mockDetermineSuggestedIssueType).toHaveBeenCalledWith('Bug', true, false, false)

		// Verify the result
		expect(result).toBe('Bug')
	})

	it('should evaluate issue type correctly when type does not match content', () => {
		// Mock return values
		mockExtractAllText.mockReturnValue('Add new feature for user registration')
		mockContainsBugIndicators.mockReturnValue(false)
		mockContainsFeatureIndicators.mockReturnValue(true)
		mockContainsTaskIndicators.mockReturnValue(false)
		mockDetermineSuggestedIssueType.mockReturnValue('Story')

		// Mock input data
		const mockIssue = {
			fields: {
				issuetype: {
					name: 'Bug',
				},
			},
		} as unknown as JiraIssue

		const mockComments = {} as IssueCommentResponse

		// Call the function
		const result = evaluateIssueType(mockIssue, mockComments)

		// Verify all functions were called with correct parameters
		expect(mockExtractAllText).toHaveBeenCalledWith(mockIssue, mockComments)
		expect(mockContainsBugIndicators).toHaveBeenCalledWith('Add new feature for user registration')
		expect(mockContainsFeatureIndicators).toHaveBeenCalledWith('Add new feature for user registration')
		expect(mockContainsTaskIndicators).toHaveBeenCalledWith('Add new feature for user registration')
		expect(mockDetermineSuggestedIssueType).toHaveBeenCalledWith('Bug', false, true, false)

		// Verify the result
		expect(result).toBe('Story')
	})
})
