import { processBlockedTransition } from '../processBlockedTransition'
import type { BlockedPeriod, StatusTransition } from '../types/durationAssessment.types'

describe('processBlockedTransition', () => {
	it('should return the current blocked period if status is null', () => {
		const blockedPeriods: BlockedPeriod[] = []
		const currentBlockedPeriod: BlockedPeriod = {
			startTime: '2023-01-01T12:00:00.000Z',
			endTime: null,
			reason: null,
		}
		const transition: StatusTransition = {
			fromStatus: 'In Progress',
			toStatus: null,
			fromStatusCategory: 'In Progress',
			toStatusCategory: null,
			timestamp: '2023-01-02T12:00:00.000Z',
		}

		const result = processBlockedTransition(blockedPeriods, currentBlockedPeriod, transition)
		expect(result).toBe(currentBlockedPeriod)
		expect(blockedPeriods.length).toBe(0)
	})

	it('should start a new blocked period when transitioning to a blocked status', () => {
		const blockedPeriods: BlockedPeriod[] = []
		const currentBlockedPeriod = null
		const timestamp = '2023-01-02T12:00:00.000Z'
		const transition: StatusTransition = {
			fromStatus: 'In Progress',
			toStatus: 'Blocked',
			fromStatusCategory: 'In Progress',
			toStatusCategory: 'Blocked',
			timestamp,
		}

		const result = processBlockedTransition(blockedPeriods, currentBlockedPeriod, transition)
		expect(result).toEqual({
			startTime: timestamp,
			endTime: null,
			reason: null,
		})
		expect(blockedPeriods.length).toBe(0)
	})

	it('should end a blocked period when transitioning from a blocked to non-blocked status', () => {
		const blockedPeriods: BlockedPeriod[] = []
		const startTime = '2023-01-01T12:00:00.000Z'
		const endTime = '2023-01-03T12:00:00.000Z'
		const currentBlockedPeriod: BlockedPeriod = {
			startTime,
			endTime: null,
			reason: null,
		}
		const transition: StatusTransition = {
			fromStatus: 'Blocked',
			toStatus: 'In Progress',
			fromStatusCategory: 'Blocked',
			toStatusCategory: 'In Progress',
			timestamp: endTime,
		}

		const result = processBlockedTransition(blockedPeriods, currentBlockedPeriod, transition)
		expect(result).toBeNull()
		expect(blockedPeriods.length).toBe(1)
		expect(blockedPeriods[0]).toEqual({
			startTime,
			endTime,
			reason: null,
		})
	})

	it('should maintain current blocked period when transitioning between non-blocked statuses', () => {
		const blockedPeriods: BlockedPeriod[] = []
		const currentBlockedPeriod = null
		const transition: StatusTransition = {
			fromStatus: 'To Do',
			toStatus: 'In Progress',
			fromStatusCategory: 'To Do',
			toStatusCategory: 'In Progress',
			timestamp: '2023-01-02T12:00:00.000Z',
		}

		const result = processBlockedTransition(blockedPeriods, currentBlockedPeriod, transition)
		expect(result).toBeNull()
		expect(blockedPeriods.length).toBe(0)
	})

	it('should maintain current blocked period when transitioning between blocked statuses', () => {
		const blockedPeriods: BlockedPeriod[] = []
		const startTime = '2023-01-01T12:00:00.000Z'
		const currentBlockedPeriod: BlockedPeriod = {
			startTime,
			endTime: null,
			reason: null,
		}
		const transition: StatusTransition = {
			fromStatus: 'Blocked',
			toStatus: 'On Hold',
			fromStatusCategory: 'Blocked',
			toStatusCategory: 'Blocked',
			timestamp: '2023-01-02T12:00:00.000Z',
		}

		const result = processBlockedTransition(blockedPeriods, currentBlockedPeriod, transition)
		expect(result).toBe(currentBlockedPeriod)
		expect(blockedPeriods.length).toBe(0)
	})
})
