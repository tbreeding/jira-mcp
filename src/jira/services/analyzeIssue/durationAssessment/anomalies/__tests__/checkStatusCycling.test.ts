import { checkStatusCycling } from '../checkStatusCycling'

describe('checkStatusCycling', () => {
	it('should return null when statusCyclingTotal is 3 or less', () => {
		expect(checkStatusCycling(0)).toBeNull()
		expect(checkStatusCycling(1)).toBeNull()
		expect(checkStatusCycling(2)).toBeNull()
		expect(checkStatusCycling(3)).toBeNull()
	})

	it('should return anomaly message when statusCyclingTotal is greater than 3', () => {
		expect(checkStatusCycling(4)).toBe('Excessive status cycling (4 status revisits)')
		expect(checkStatusCycling(7)).toBe('Excessive status cycling (7 status revisits)')
	})
})
