import { isActiveStatus } from '../isActiveStatus'

describe('isActiveStatus', () => {
	test('should return true for statuses that contain active keywords', () => {
		// Test various active status names
		expect(isActiveStatus('In Progress')).toBe(true)
		expect(isActiveStatus('Developing')).toBe(true)
		expect(isActiveStatus('Implementing')).toBe(true)
		expect(isActiveStatus('Coding')).toBe(true)
		expect(isActiveStatus('Working')).toBe(true)
		expect(isActiveStatus('Active')).toBe(true)
		expect(isActiveStatus('Development in progress')).toBe(true)
	})

	test('should return false for statuses that contain inactive keywords', () => {
		// Test various inactive status names
		expect(isActiveStatus('Blocked')).toBe(false)
		expect(isActiveStatus('Waiting')).toBe(false)
		expect(isActiveStatus('On Hold')).toBe(false)
		expect(isActiveStatus('Pending')).toBe(false)
		expect(isActiveStatus('In Review')).toBe(false)
		expect(isActiveStatus('Testing')).toBe(false)
		expect(isActiveStatus('QA')).toBe(false)
		expect(isActiveStatus('Done')).toBe(false)
		expect(isActiveStatus('Resolved')).toBe(false)
		expect(isActiveStatus('Closed')).toBe(false)
	})

	test('should return false for statuses that are not explicitly active', () => {
		// Test status names that don't contain active keywords
		expect(isActiveStatus('To Do')).toBe(false)
		expect(isActiveStatus('Backlog')).toBe(false)
		expect(isActiveStatus('Open')).toBe(false)
		expect(isActiveStatus('Created')).toBe(false)
	})

	test('should handle mixed status names correctly', () => {
		// Test status names that contain both active and inactive keywords
		expect(isActiveStatus('In Progress but Blocked')).toBe(false)
		expect(isActiveStatus('Working on Review')).toBe(false)
		expect(isActiveStatus('Progress Review')).toBe(false)
		expect(isActiveStatus('In Progress Waiting for Approval')).toBe(false)
	})

	test('should be case insensitive', () => {
		// Test case insensitivity
		expect(isActiveStatus('in progress')).toBe(true)
		expect(isActiveStatus('IN PROGRESS')).toBe(true)
		expect(isActiveStatus('blocked')).toBe(false)
		expect(isActiveStatus('BLOCKED')).toBe(false)
	})
})
