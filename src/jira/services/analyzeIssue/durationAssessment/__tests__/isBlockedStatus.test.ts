import { isBlockedStatus } from '../isBlockedStatus'

describe('isBlockedStatus', () => {
	it('should return false for null status', () => {
		expect(isBlockedStatus(null)).toBe(false)
	})

	it('should return false for empty string status', () => {
		expect(isBlockedStatus('')).toBe(false)
	})

	it('should return true for status containing "blocked"', () => {
		expect(isBlockedStatus('Blocked')).toBe(true)
		expect(isBlockedStatus('BLOCKED')).toBe(true)
		expect(isBlockedStatus('is blocked')).toBe(true)
		expect(isBlockedStatus('Status Blocked')).toBe(true)
	})

	it('should return true for status containing "on hold"', () => {
		expect(isBlockedStatus('On Hold')).toBe(true)
		expect(isBlockedStatus('ON HOLD')).toBe(true)
		expect(isBlockedStatus('Issue on hold')).toBe(true)
	})

	it('should return true for status containing "waiting"', () => {
		expect(isBlockedStatus('Waiting')).toBe(true)
		expect(isBlockedStatus('WAITING')).toBe(true)
		expect(isBlockedStatus('Waiting for response')).toBe(true)
	})

	it('should return true for status containing "pending"', () => {
		expect(isBlockedStatus('Pending')).toBe(true)
		expect(isBlockedStatus('PENDING')).toBe(true)
		expect(isBlockedStatus('Pending approval')).toBe(true)
	})

	it('should return true for status containing "impediment"', () => {
		expect(isBlockedStatus('Impediment')).toBe(true)
		expect(isBlockedStatus('IMPEDIMENT')).toBe(true)
		expect(isBlockedStatus('Has impediment')).toBe(true)
	})

	it('should return false for statuses not related to blocking', () => {
		expect(isBlockedStatus('Todo')).toBe(false)
		expect(isBlockedStatus('In Progress')).toBe(false)
		expect(isBlockedStatus('Done')).toBe(false)
		expect(isBlockedStatus('Review')).toBe(false)
	})
})
