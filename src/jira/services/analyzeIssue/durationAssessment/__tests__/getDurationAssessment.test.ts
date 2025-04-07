import { getDurationAssessment } from '../getDurationAssessment'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'

// Mock dependencies
jest.mock('../calculateInProgressDuration', () => ({
	calculateInProgressDuration: jest.fn().mockReturnValue({
		inProgressDays: 5,
		firstInProgress: '2023-01-01T10:00:00.000Z',
		lastDone: '2023-01-08T15:30:00.000Z',
	}),
}))

jest.mock('../analyzeSprintBoundaries', () => ({
	analyzeSprintBoundaries: jest.fn().mockReturnValue({
		exceedsSprint: true,
		sprintReassignments: 2,
	}),
}))

jest.mock('../utils/storyPoints/calculatePointToDurationRatio', () => ({
	calculatePointToDurationRatio: jest.fn().mockReturnValue(0.8),
}))

jest.mock('../calculateStatusTimings', () => ({
	calculateStatusTimings: jest.fn().mockReturnValue({
		'To Do': 24.5,
		'In Progress': 72.3,
		Review: 12.8,
		Done: 0,
	}),
}))

jest.mock('../detectStatusCycling', () => ({
	detectStatusCycling: jest.fn().mockReturnValue({
		count: {
			'To Do': 1,
			'In Progress': 0,
			Review: 0,
			Done: 0,
		},
		totalRevisits: 1,
	}),
}))

jest.mock('../assessBlockedTime', () => ({
	assessBlockedTime: jest.fn().mockReturnValue({
		totalDays: 2,
		reasons: ['Waiting for deployment'],
	}),
}))

jest.mock('../identifyDurationAnomalies', () => ({
	identifyDurationAnomalies: jest.fn().mockReturnValue(['Issue reassigned across sprints 2 times']),
}))

describe('getDurationAssessment', () => {
	const mockIssue = {} as JiraIssue
	const mockComments: IssueCommentResponse = {
		comments: [],
		startAt: 0,
		maxResults: 0,
		total: 0,
	}

	it('should correctly assemble duration assessment from component functions', () => {
		const result = getDurationAssessment(mockIssue, mockComments)

		expect(result).toEqual({
			inProgressDays: 5,
			exceedsSprint: true,
			sprintReassignments: 2,
			pointToDurationRatio: 0.8,
			statusTransitions: {
				firstInProgress: '2023-01-01T10:00:00.000Z',
				lastDone: '2023-01-08T15:30:00.000Z',
				averageTimeInStatus: {
					'To Do': 24.5,
					'In Progress': 72.3,
					Review: 12.8,
					Done: 0,
				},
			},
			statusCycling: {
				count: {
					'To Do': 1,
					'In Progress': 0,
					Review: 0,
					Done: 0,
				},
				totalRevisits: 1,
			},
			blockedTime: {
				totalDays: 2,
				reasons: ['Waiting for deployment'],
			},
			anomalies: ['Issue reassigned across sprints 2 times'],
		})
	})
})
