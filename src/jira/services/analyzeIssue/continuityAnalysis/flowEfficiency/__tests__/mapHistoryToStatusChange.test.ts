import { mapHistoryToStatusChange } from '../mapHistoryToStatusChange'

describe('mapHistoryToStatusChange', () => {
	test('should map history item with status field to status change object', () => {
		const mockHistory = {
			created: '2023-01-01T10:00:00.000Z',
			items: [
				{
					field: 'status',
					fromString: 'To Do',
					toString: 'In Progress',
				},
			],
		}

		const result = mapHistoryToStatusChange(mockHistory)

		expect(result).toEqual({
			date: new Date('2023-01-01T10:00:00.000Z'),
			fromStatus: 'To Do',
			toStatus: 'In Progress',
		})
	})

	test('should handle history with no status field item', () => {
		const mockHistory = {
			created: '2023-01-01T10:00:00.000Z',
			items: [
				{
					field: 'priority',
					fromString: 'Low',
					toString: 'High',
				},
			],
		}

		const result = mapHistoryToStatusChange(mockHistory)

		expect(result).toEqual({
			date: new Date('2023-01-01T10:00:00.000Z'),
			fromStatus: null,
			toStatus: null,
		})
	})

	test('should handle history with multiple items including status', () => {
		const mockHistory = {
			created: '2023-01-01T10:00:00.000Z',
			items: [
				{
					field: 'priority',
					fromString: 'Low',
					toString: 'High',
				},
				{
					field: 'status',
					fromString: 'To Do',
					toString: 'In Progress',
				},
				{
					field: 'assignee',
					fromString: 'User A',
					toString: 'User B',
				},
			],
		}

		const result = mapHistoryToStatusChange(mockHistory)

		expect(result).toEqual({
			date: new Date('2023-01-01T10:00:00.000Z'),
			fromStatus: 'To Do',
			toStatus: 'In Progress',
		})
	})

	test('should handle null fromString and toString', () => {
		const mockHistory = {
			created: '2023-01-01T10:00:00.000Z',
			items: [
				{
					field: 'status',
					fromString: null,
					toString: null,
				},
			],
		}

		const result = mapHistoryToStatusChange(mockHistory)

		expect(result).toEqual({
			date: new Date('2023-01-01T10:00:00.000Z'),
			fromStatus: null,
			toStatus: null,
		})
	})

	test('should handle empty string fromString and toString', () => {
		const mockHistory = {
			created: '2023-01-01T10:00:00.000Z',
			items: [
				{
					field: 'status',
					fromString: '',
					toString: '',
				},
			],
		}

		const result = mapHistoryToStatusChange(mockHistory)

		expect(result).toEqual({
			date: new Date('2023-01-01T10:00:00.000Z'),
			fromStatus: '',
			toStatus: '',
		})
	})

	test('should handle undefined fromString and toString', () => {
		const mockHistory = {
			created: '2023-01-01T10:00:00.000Z',
			items: [
				{
					field: 'status',
					fromString: undefined,
					toString: undefined,
				},
			],
		}

		const result = mapHistoryToStatusChange(mockHistory)

		expect(result).toEqual({
			date: new Date('2023-01-01T10:00:00.000Z'),
			fromStatus: null,
			toStatus: null,
		})
	})
})
