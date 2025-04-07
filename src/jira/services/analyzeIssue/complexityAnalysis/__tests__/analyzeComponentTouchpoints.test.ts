import { analyzeComponentTouchpoints } from '../analyzeComponentTouchpoints'
import type { JiraIssue } from '../../../../types/issue.types'

describe('analyzeComponentTouchpoints', function () {
	test('should return score 0 when there are no components', function () {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const result = analyzeComponentTouchpoints(mockIssue)

		expect(result.score).toBe(0)
		expect(result.factor).toBeNull()
	})

	test('should handle empty components array', function () {
		const mockIssue = {
			fields: {
				components: [],
			},
		} as unknown as JiraIssue

		const result = analyzeComponentTouchpoints(mockIssue)

		expect(result.score).toBe(0)
		expect(result.factor).toBeNull()
	})

	test('should return score 1 for a single component', function () {
		const mockIssue = {
			fields: {
				components: [{ name: 'Backend' }],
			},
		} as unknown as JiraIssue

		const result = analyzeComponentTouchpoints(mockIssue)

		expect(result.score).toBe(1)
		expect(result.factor).toBe('Component touchpoints: Issue affects 1 components/systems')
	})

	test('should return score 2 for 2-3 components', function () {
		const mockIssue = {
			fields: {
				components: [{ name: 'Backend' }, { name: 'Frontend' }],
			},
		} as unknown as JiraIssue

		const result = analyzeComponentTouchpoints(mockIssue)

		expect(result.score).toBe(2)
		expect(result.factor).toBe('Component touchpoints: Issue affects 2 components/systems')
	})

	test('should return score 3 for more than 3 components', function () {
		const mockIssue = {
			fields: {
				components: [{ name: 'Backend' }, { name: 'Frontend' }, { name: 'Database' }, { name: 'API' }],
			},
		} as unknown as JiraIssue

		const result = analyzeComponentTouchpoints(mockIssue)

		expect(result.score).toBe(3)
		expect(result.factor).toBe('Component touchpoints: Issue affects 4 components/systems')
	})
})
