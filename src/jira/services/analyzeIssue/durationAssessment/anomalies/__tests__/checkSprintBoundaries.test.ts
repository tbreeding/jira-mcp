import { checkSprintBoundaries } from '../checkSprintBoundaries'

describe('checkSprintBoundaries', () => {
	it('should return null when sprintReassignments is 0', () => {
		expect(checkSprintBoundaries(0)).toBeNull()
	})

	it('should return anomaly message when sprintReassignments is greater than 0', () => {
		expect(checkSprintBoundaries(1)).toBe('Issue reassigned across sprints 1 times')
		expect(checkSprintBoundaries(3)).toBe('Issue reassigned across sprints 3 times')
	})
})
