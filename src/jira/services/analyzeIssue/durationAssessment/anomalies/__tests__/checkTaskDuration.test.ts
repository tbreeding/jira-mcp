import { checkTaskDuration } from '../checkTaskDuration'

describe('checkTaskDuration', () => {
	it('should return null when inProgressDays is null', () => {
		expect(checkTaskDuration(null)).toBeNull()
	})

	it('should return null when inProgressDays is 3 or less', () => {
		expect(checkTaskDuration(1)).toBeNull()
		expect(checkTaskDuration(3)).toBeNull()
	})

	it('should return anomaly message when inProgressDays is greater than 3', () => {
		expect(checkTaskDuration(4)).toBe('Task taking longer than expected (4 days)')
		expect(checkTaskDuration(7)).toBe('Task taking longer than expected (7 days)')
	})
})
