/**
 * Tests for the status category functions
 */
import { determineStatusCategory, isDoneStatus, isInProgressStatus, isToDoStatus } from '../statusCategories'

describe('Status category functions', () => {
	describe('isDoneStatus', () => {
		test('should identify done statuses correctly', () => {
			expect(isDoneStatus('done')).toBe(true)
			expect(isDoneStatus('complete')).toBe(true)
			expect(isDoneStatus('resolved')).toBe(true)
			expect(isDoneStatus('task is done')).toBe(true)
			expect(isDoneStatus('marked as complete')).toBe(true)
		})

		test('should return false for non-done statuses', () => {
			expect(isDoneStatus('in progress')).toBe(false)
			expect(isDoneStatus('to do')).toBe(false)
			expect(isDoneStatus('pending')).toBe(false)
		})
	})

	describe('isInProgressStatus', () => {
		test('should identify in progress statuses correctly', () => {
			expect(isInProgressStatus('in progress')).toBe(true)
			expect(isInProgressStatus('under review')).toBe(true)
			expect(isInProgressStatus('dev complete')).toBe(true)
			expect(isInProgressStatus('in dev')).toBe(true)
		})

		test('should return false for non-progress statuses', () => {
			expect(isInProgressStatus('done')).toBe(false)
			expect(isInProgressStatus('to do')).toBe(false)
			expect(isInProgressStatus('pending')).toBe(false)
		})
	})

	describe('isToDoStatus', () => {
		test('should identify to do statuses correctly', () => {
			expect(isToDoStatus('to do')).toBe(true)
			expect(isToDoStatus('backlog')).toBe(true)
			expect(isToDoStatus('open')).toBe(true)
			expect(isToDoStatus('in backlog')).toBe(true)
		})

		test('should return false for non-to-do statuses', () => {
			expect(isToDoStatus('done')).toBe(false)
			expect(isToDoStatus('in progress')).toBe(false)
			expect(isToDoStatus('pending')).toBe(false)
		})
	})

	describe('determineStatusCategory', () => {
		test('should return the correct category for done statuses', () => {
			expect(determineStatusCategory('Done')).toBe('done')
			expect(determineStatusCategory('Complete')).toBe('done')
			expect(determineStatusCategory('RESOLVED')).toBe('done')
		})

		test('should return the correct category for in progress statuses', () => {
			expect(determineStatusCategory('In Progress')).toBe('indeterminate')
			expect(determineStatusCategory('Under Review')).toBe('indeterminate')
			expect(determineStatusCategory('In Dev')).toBe('indeterminate')
		})

		test('should return the correct category for to do statuses', () => {
			expect(determineStatusCategory('To Do')).toBe('new')
			expect(determineStatusCategory('Backlog')).toBe('new')
			expect(determineStatusCategory('OPEN')).toBe('new')
		})

		test('should return null for unknown status types', () => {
			expect(determineStatusCategory('Unknown Status')).toBeNull()
			expect(determineStatusCategory('Pending')).toBeNull()
		})

		test('should handle null input', () => {
			expect(determineStatusCategory(null)).toBeNull()
		})
	})
})
