import { createStatusPeriod } from '../createStatusPeriod'

describe('createStatusPeriod', () => {
	it('should return null when currentStatus is null', () => {
		const result = createStatusPeriod(null, 'new', '2023-01-01T00:00:00.000Z', '2023-01-02T00:00:00.000Z')
		expect(result).toBeNull()
	})

	it('should use "unknown" when currentStatusCategory is null', () => {
		const result = createStatusPeriod('To Do', null, '2023-01-01T00:00:00.000Z', '2023-01-02T00:00:00.000Z')
		expect(result).toEqual({
			status: 'To Do',
			statusCategory: 'unknown',
			startTime: '2023-01-01T00:00:00.000Z',
			endTime: '2023-01-02T00:00:00.000Z',
		})
	})

	it('should create a status period with all provided values', () => {
		const result = createStatusPeriod(
			'In Progress',
			'indeterminate',
			'2023-01-01T00:00:00.000Z',
			'2023-01-02T00:00:00.000Z',
		)
		expect(result).toEqual({
			status: 'In Progress',
			statusCategory: 'indeterminate',
			startTime: '2023-01-01T00:00:00.000Z',
			endTime: '2023-01-02T00:00:00.000Z',
		})
	})

	it('should handle null endTime', () => {
		const result = createStatusPeriod('Done', 'done', '2023-01-01T00:00:00.000Z', null)
		expect(result).toEqual({
			status: 'Done',
			statusCategory: 'done',
			startTime: '2023-01-01T00:00:00.000Z',
			endTime: null,
		})
	})
})
