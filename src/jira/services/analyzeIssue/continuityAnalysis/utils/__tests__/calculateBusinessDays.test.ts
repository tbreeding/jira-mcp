import { calculateBusinessDays } from '../calculateBusinessDays'

describe('calculateBusinessDays', () => {
	test('should return 1 for the same business day', () => {
		const result = calculateBusinessDays('2023-01-02T10:00:00.000Z', '2023-01-02T16:00:00.000Z')
		expect(result).toBe(1)
	})

	test('should return 0 for the same weekend day', () => {
		// January 1, 2023 was a Sunday
		const result = calculateBusinessDays('2023-01-01T10:00:00.000Z', '2023-01-01T16:00:00.000Z')
		expect(result).toBe(0)
	})

	test('should count exactly 5 business days in a regular work week', () => {
		// Jan 2-6, 2023 was a Monday through Friday
		const result = calculateBusinessDays('2023-01-02T00:00:00.000Z', '2023-01-06T23:59:59.999Z')
		expect(result).toBe(5)
	})

	test('should not count weekends in a full week', () => {
		// Jan 1-7, 2023 was a full week (Sunday to Saturday)
		const result = calculateBusinessDays('2023-01-01T00:00:00.000Z', '2023-01-07T23:59:59.999Z')
		expect(result).toBe(5)
	})

	test('should count business days across multiple weeks', () => {
		// Jan 2-13, 2023 was two work weeks (10 business days)
		const result = calculateBusinessDays('2023-01-02T00:00:00.000Z', '2023-01-13T23:59:59.999Z')
		expect(result).toBe(10)
	})

	test('should return 0 when start date is after end date', () => {
		const result = calculateBusinessDays('2023-01-05T00:00:00.000Z', '2023-01-04T23:59:59.999Z')
		expect(result).toBe(0)
	})

	test('should handle dates across month boundaries', () => {
		// Jan 30 - Feb 3, 2023 (5 business days, Monday to Friday)
		const result = calculateBusinessDays('2023-01-30T00:00:00.000Z', '2023-02-03T23:59:59.999Z')
		expect(result).toBe(5)
	})

	test('should handle dates across year boundaries', () => {
		// Dec 29, 2022 - Jan 2, 2023 (3 business days: Thu, Fri, Mon)
		const result = calculateBusinessDays('2022-12-29T00:00:00.000Z', '2023-01-02T23:59:59.999Z')
		expect(result).toBe(3)
	})

	test('should return correct business days for partial weeks', () => {
		// Jan 4-8, 2023 (Wed, Thu, Fri = 3 business days)
		const result = calculateBusinessDays('2023-01-04T00:00:00.000Z', '2023-01-08T23:59:59.999Z')
		expect(result).toBe(3)
	})

	test('should ignore time portions of dates', () => {
		// Although times differ, these are still the same 5 business days
		const result = calculateBusinessDays('2023-01-02T06:00:00.000Z', '2023-01-06T18:00:00.000Z')
		expect(result).toBe(5)
	})
})
