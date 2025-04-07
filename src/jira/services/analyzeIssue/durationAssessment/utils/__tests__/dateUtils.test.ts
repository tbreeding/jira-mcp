import { calculateBusinessDays, calculateHoursBetween } from '../dateUtils'

describe('dateUtils', () => {
	describe('calculateBusinessDays', () => {
		it('should return 0 for invalid dates', () => {
			expect(calculateBusinessDays('invalid-date', '2023-01-10')).toBe(0)
			expect(calculateBusinessDays('2023-01-10', 'invalid-date')).toBe(0)
			expect(calculateBusinessDays('invalid-date', 'invalid-date')).toBe(0)
		})

		it('should return 0 when start date is after end date', () => {
			expect(calculateBusinessDays('2023-01-10', '2023-01-05')).toBe(0)
		})

		it('should return 1 for same day if it is a business day', () => {
			// 2023-01-09 was a Monday
			expect(calculateBusinessDays('2023-01-09', '2023-01-09')).toBe(1)
		})

		it('should return 0 for same day if it is a weekend', () => {
			// 2023-01-07 was a Saturday
			expect(calculateBusinessDays('2023-01-07', '2023-01-07')).toBe(0)
		})

		it('should correctly calculate business days excluding weekends', () => {
			// Monday to Friday = 5 business days
			expect(calculateBusinessDays('2023-01-09', '2023-01-13')).toBe(5)

			// Monday to Monday (next week) = 6 business days (excludes the weekend)
			expect(calculateBusinessDays('2023-01-09', '2023-01-16')).toBe(6)

			// Including a full weekend
			expect(calculateBusinessDays('2023-01-06', '2023-01-11')).toBe(4)
		})

		it('should handle month boundaries correctly', () => {
			// Jan 30 (Mon) to Feb 3 (Fri) = 5 business days
			expect(calculateBusinessDays('2023-01-30', '2023-02-03')).toBe(5)
		})

		it('should handle year boundaries correctly', () => {
			// Dec 29, 2022 (Thu) to Jan 4, 2023 (Wed) = 5 business days (according to implementation)
			expect(calculateBusinessDays('2022-12-29', '2023-01-04')).toBe(5)
		})
	})

	describe('calculateHoursBetween', () => {
		it('should return 0 for invalid dates', () => {
			expect(calculateHoursBetween('invalid-date', '2023-01-10')).toBe(0)
			expect(calculateHoursBetween('2023-01-10', 'invalid-date')).toBe(0)
			expect(calculateHoursBetween('invalid-date', 'invalid-date')).toBe(0)
		})

		it('should return 0 when start date is after end date', () => {
			expect(calculateHoursBetween('2023-01-10T12:00:00.000Z', '2023-01-10T10:00:00.000Z')).toBe(0)
		})

		it('should return 0 for equal timestamps', () => {
			expect(calculateHoursBetween('2023-01-10T12:00:00.000Z', '2023-01-10T12:00:00.000Z')).toBe(0)
		})

		it('should correctly calculate hours between timestamps', () => {
			// Exactly 1 hour
			expect(calculateHoursBetween('2023-01-10T12:00:00.000Z', '2023-01-10T13:00:00.000Z')).toBe(1)

			// 24 hours (a full day)
			expect(calculateHoursBetween('2023-01-10T12:00:00.000Z', '2023-01-11T12:00:00.000Z')).toBe(24)

			// 1.5 hours, should round to 1.5
			expect(calculateHoursBetween('2023-01-10T12:00:00.000Z', '2023-01-10T13:30:00.000Z')).toBe(1.5)

			// 2 hours and 36 minutes, should round to 2.6
			expect(calculateHoursBetween('2023-01-10T12:00:00.000Z', '2023-01-10T14:36:00.000Z')).toBe(2.6)
		})

		it('should handle date boundaries correctly', () => {
			// 12:00 AM to 12:00 PM = 12 hours
			expect(calculateHoursBetween('2023-01-10T00:00:00.000Z', '2023-01-10T12:00:00.000Z')).toBe(12)
		})

		it('should handle month and year boundaries correctly', () => {
			// Dec 31, 2022 11:00 PM to Jan 1, 2023 1:00 AM = 2 hours
			expect(calculateHoursBetween('2022-12-31T23:00:00.000Z', '2023-01-01T01:00:00.000Z')).toBe(2)
		})
	})
})
