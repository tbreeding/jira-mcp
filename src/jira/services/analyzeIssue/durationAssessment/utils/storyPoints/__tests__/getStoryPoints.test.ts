import { getStoryPoints } from '../getStoryPoints'
import { STORY_POINT_FIELD, OTHER_STORY_POINT_FIELDS } from '../storyPointFields'
import type { JiraIssue } from '../../../../../../types/issue.types'

describe('getStoryPoints', () => {
	test('returns story points from primary field', () => {
		const mockIssue = {
			fields: {
				[STORY_POINT_FIELD]: 5,
			},
		} as unknown as JiraIssue

		expect(getStoryPoints(mockIssue)).toBe(5)
	})

	test('returns story points from alternative fields', () => {
		// Create an issue with no primary field but with alternative fields
		const mockIssue = {
			fields: {
				[OTHER_STORY_POINT_FIELDS[0]]: null,
				[OTHER_STORY_POINT_FIELDS[1]]: null,
				[OTHER_STORY_POINT_FIELDS[2]]: 3,
				[OTHER_STORY_POINT_FIELDS[3]]: 8,
			},
		} as unknown as JiraIssue

		expect(getStoryPoints(mockIssue)).toBe(3)
	})

	test('returns story points from object with value property', () => {
		const mockIssue = {
			fields: {
				[STORY_POINT_FIELD]: { value: 5 },
			},
		} as unknown as JiraIssue

		expect(getStoryPoints(mockIssue)).toBe(5)
	})

	test('returns null when no story points found', () => {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		expect(getStoryPoints(mockIssue)).toBeNull()
	})
})
