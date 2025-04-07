import { analyzeEstimationChanges } from '../analyzeEstimationChanges'
import type { JiraIssue } from '../../../../types/issue.types'

describe('analyzeEstimationChanges', function () {
	test('should return score 0 when there are no estimation changes', function () {
		const mockIssue = {
			changelog: {
				histories: [],
			},
		} as unknown as JiraIssue

		const result = analyzeEstimationChanges(mockIssue)

		expect(result.score).toBe(0)
		expect(result.factor).toBeNull()
	})

	test('should return score 1 when there are few estimation changes', function () {
		const mockIssue = {
			changelog: {
				histories: [
					{
						items: [{ field: 'timeestimate', from: '2h', to: '4h' }],
					},
				],
			},
		} as unknown as JiraIssue

		const result = analyzeEstimationChanges(mockIssue)

		expect(result.score).toBe(1)
		expect(result.factor).toBe('Estimation changes: Estimate was adjusted 1 times')
	})

	test('should return score 2 when there are many estimation changes', function () {
		const mockIssue = {
			changelog: {
				histories: [
					{
						items: [{ field: 'timeestimate', from: '2h', to: '4h' }],
					},
					{
						items: [{ field: 'timeoriginalestimate', from: '4h', to: '6h' }],
					},
					{
						items: [{ field: 'customfield_10106', from: '3', to: '5' }],
					},
				],
			},
		} as unknown as JiraIssue

		const result = analyzeEstimationChanges(mockIssue)

		expect(result.score).toBe(2)
		expect(result.factor).toBe('Estimation changes: Estimate was adjusted 3 times')
	})

	test('should handle multiple estimation changes in one history', function () {
		const mockIssue = {
			changelog: {
				histories: [
					{
						items: [
							{ field: 'timeestimate', from: '2h', to: '4h' },
							{ field: 'timeoriginalestimate', from: '2h', to: '4h' },
						],
					},
				],
			},
		} as unknown as JiraIssue

		const result = analyzeEstimationChanges(mockIssue)

		expect(result.score).toBe(1)
		expect(result.factor).toBe('Estimation changes: Estimate was adjusted 2 times')
	})

	test('should handle issues with no changelog', function () {
		const mockIssue = {} as unknown as JiraIssue

		const result = analyzeEstimationChanges(mockIssue)

		expect(result.score).toBe(0)
		expect(result.factor).toBeNull()
	})
})
