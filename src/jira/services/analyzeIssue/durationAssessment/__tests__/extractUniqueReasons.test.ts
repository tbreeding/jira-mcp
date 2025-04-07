import { extractUniqueReasons } from '../extractUniqueReasons'
import type { BlockedPeriod } from '../types/durationAssessment.types'

describe('extractUniqueReasons', () => {
	it('should return an empty array when no blocked periods are provided', () => {
		const blockedPeriods: BlockedPeriod[] = []
		const result = extractUniqueReasons(blockedPeriods)
		expect(result).toEqual([])
	})

	it('should return an empty array when no blocked periods have reasons', () => {
		const blockedPeriods: BlockedPeriod[] = [
			{
				startTime: '2023-01-01T12:00:00.000Z',
				endTime: '2023-01-03T12:00:00.000Z',
				reason: null,
			},
			{
				startTime: '2023-01-05T12:00:00.000Z',
				endTime: '2023-01-07T12:00:00.000Z',
				reason: null,
			},
		]
		const result = extractUniqueReasons(blockedPeriods)
		expect(result).toEqual([])
	})

	it('should extract unique reasons from blocked periods', () => {
		const blockedPeriods: BlockedPeriod[] = [
			{
				startTime: '2023-01-01T12:00:00.000Z',
				endTime: '2023-01-03T12:00:00.000Z',
				reason: 'Waiting for approval',
			},
			{
				startTime: '2023-01-05T12:00:00.000Z',
				endTime: '2023-01-07T12:00:00.000Z',
				reason: 'Waiting for external team',
			},
			{
				startTime: '2023-01-10T12:00:00.000Z',
				endTime: '2023-01-12T12:00:00.000Z',
				reason: 'Waiting for approval',
			},
		]
		const result = extractUniqueReasons(blockedPeriods)
		expect(result).toEqual(['Waiting for approval', 'Waiting for external team'])
	})

	it('should handle a mix of null and valid reasons', () => {
		const blockedPeriods: BlockedPeriod[] = [
			{
				startTime: '2023-01-01T12:00:00.000Z',
				endTime: '2023-01-03T12:00:00.000Z',
				reason: null,
			},
			{
				startTime: '2023-01-05T12:00:00.000Z',
				endTime: '2023-01-07T12:00:00.000Z',
				reason: 'Waiting for external team',
			},
			{
				startTime: '2023-01-10T12:00:00.000Z',
				endTime: '2023-01-12T12:00:00.000Z',
				reason: null,
			},
		]
		const result = extractUniqueReasons(blockedPeriods)
		expect(result).toEqual(['Waiting for external team'])
	})
})
