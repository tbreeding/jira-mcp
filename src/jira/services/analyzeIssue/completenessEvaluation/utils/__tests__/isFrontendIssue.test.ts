import { isFrontendIssue } from '../isFrontendIssue'

describe('isFrontendIssue', function () {
	it('returns true for frontend-related issue types', function () {
		expect(isFrontendIssue('UI Bug')).toBe(true)
		expect(isFrontendIssue('Frontend Feature')).toBe(true)
		expect(isFrontendIssue('User Interface Improvement')).toBe(true)
		expect(isFrontendIssue('Design Update')).toBe(true)
		expect(isFrontendIssue('UX Enhancement')).toBe(true)
		expect(isFrontendIssue('Visual Regression')).toBe(true)
		expect(isFrontendIssue('Screen Layout')).toBe(true)
	})

	it('returns false for non-frontend issue types', function () {
		expect(isFrontendIssue('Backend Bug')).toBe(false)
		expect(isFrontendIssue('Database Performance')).toBe(false)
		expect(isFrontendIssue('API Enhancement')).toBe(false)
		expect(isFrontendIssue('Infrastructure Task')).toBe(false)
		expect(isFrontendIssue('Security Vulnerability')).toBe(false)
	})

	it('handles mixed case inputs correctly', function () {
		expect(isFrontendIssue('ui component')).toBe(true)
		expect(isFrontendIssue('FRONTEND TASK')).toBe(true)
		expect(isFrontendIssue('User INTERFACE')).toBe(true)
	})
})
