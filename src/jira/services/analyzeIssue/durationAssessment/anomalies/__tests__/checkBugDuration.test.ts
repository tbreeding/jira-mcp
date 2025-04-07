import { checkBugDuration } from '../checkBugDuration'

describe('checkBugDuration', () => {
	it('should return null when inProgressDays is null', () => {
		expect(checkBugDuration(null)).toBeNull()
	})

	it('should return null when inProgressDays is 5 or less', () => {
		expect(checkBugDuration(3)).toBeNull()
		expect(checkBugDuration(5)).toBeNull()
	})

	it('should return anomaly message when inProgressDays is greater than 5', () => {
		expect(checkBugDuration(6)).toBe('Bug fix taking longer than expected (6 days)')
		expect(checkBugDuration(10)).toBe('Bug fix taking longer than expected (10 days)')
	})
})
