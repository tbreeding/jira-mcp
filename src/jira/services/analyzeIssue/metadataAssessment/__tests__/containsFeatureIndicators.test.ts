import { containsFeatureIndicators } from '../containsFeatureIndicators'

describe('containsFeatureIndicators', () => {
	it('should return true when text contains feature indicators', () => {
		// Test with various feature indicators
		expect(containsFeatureIndicators('Add a new feature to the dashboard')).toBe(true)
		expect(containsFeatureIndicators('Implement user authentication system')).toBe(true)
		expect(containsFeatureIndicators('Create a reporting module')).toBe(true)
		expect(containsFeatureIndicators('This enhancement would improve user experience')).toBe(true)
		expect(containsFeatureIndicators('As a user, I want to export data')).toBe(true)
		expect(containsFeatureIndicators('Users should be able to reset their passwords')).toBe(true)
		expect(containsFeatureIndicators('We need to add pagination to the table')).toBe(true)
		expect(containsFeatureIndicators('This user story covers search functionality')).toBe(true)
	})

	it('should return false when text does not contain feature indicators', () => {
		// Test with non-feature related text
		expect(containsFeatureIndicators('Fix the login bug')).toBe(false)
		expect(containsFeatureIndicators('Issue with database connection')).toBe(false)
		expect(containsFeatureIndicators('The system is crashing')).toBe(false)
		expect(containsFeatureIndicators('')).toBe(false)
	})
})
