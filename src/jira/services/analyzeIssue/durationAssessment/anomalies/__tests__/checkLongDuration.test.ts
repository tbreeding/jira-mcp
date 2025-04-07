import { checkLongDuration } from '../checkLongDuration'

describe('checkLongDuration', () => {
	it('should return null when inProgressDays is null', () => {
		expect(checkLongDuration(null)).toBeNull()
	})

	it('should return null when inProgressDays is 10 or less', () => {
		expect(checkLongDuration(5)).toBeNull()
		expect(checkLongDuration(10)).toBeNull()
	})

	it('should return anomaly message when inProgressDays is greater than 10', () => {
		expect(checkLongDuration(11)).toBe('Long in-progress duration (11 business days)')
		expect(checkLongDuration(15)).toBe('Long in-progress duration (15 business days)')
	})
})
