import { startBlockedPeriod } from '../startBlockedPeriod'

describe('startBlockedPeriod', () => {
	it('should create a new blocked period with the provided timestamp', () => {
		const timestamp = '2023-01-01T12:00:00.000Z'
		const result = startBlockedPeriod(timestamp)

		expect(result).toEqual({
			startTime: timestamp,
			endTime: null,
			reason: null,
		})
	})

	it('should set endTime and reason to null', () => {
		const timestamp = '2023-01-01T12:00:00.000Z'
		const result = startBlockedPeriod(timestamp)

		expect(result.endTime).toBeNull()
		expect(result.reason).toBeNull()
	})
})
