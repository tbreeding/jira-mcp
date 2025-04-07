import { endBlockedPeriod } from '../endBlockedPeriod'
import type { BlockedPeriod } from '../types/durationAssessment.types'

describe('endBlockedPeriod', () => {
	it('should update the blocked period with the end time', () => {
		const startTime = '2023-01-01T12:00:00.000Z'
		const endTime = '2023-01-03T12:00:00.000Z'

		const currentBlockedPeriod: BlockedPeriod = {
			startTime,
			endTime: null,
			reason: null,
		}

		const result = endBlockedPeriod(currentBlockedPeriod, endTime)

		expect(result).toEqual({
			startTime,
			endTime,
			reason: null,
		})
	})

	it('should preserve the reason when updating end time', () => {
		const startTime = '2023-01-01T12:00:00.000Z'
		const endTime = '2023-01-03T12:00:00.000Z'
		const reason = 'Waiting for approval'

		const currentBlockedPeriod: BlockedPeriod = {
			startTime,
			endTime: null,
			reason,
		}

		const result = endBlockedPeriod(currentBlockedPeriod, endTime)

		expect(result).toEqual({
			startTime,
			endTime,
			reason,
		})
	})
})
