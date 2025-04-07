import { containsTaskIndicators } from '../containsTaskIndicators'

describe('containsTaskIndicators', () => {
	it('should return true when text contains task indicators', () => {
		// Test with various task indicators
		expect(containsTaskIndicators('Update the documentation')).toBe(true)
		expect(containsTaskIndicators('Change the color scheme')).toBe(true)
		expect(containsTaskIndicators('Modify the configuration settings')).toBe(true)
		expect(containsTaskIndicators('Refactor the authentication logic')).toBe(true)
		expect(containsTaskIndicators('Improve performance of the query')).toBe(true)
		expect(containsTaskIndicators('Optimize the database indexing')).toBe(true)
		expect(containsTaskIndicators('Clean up deprecated code')).toBe(true)
		expect(containsTaskIndicators('Organize the CSS files')).toBe(true)
		expect(containsTaskIndicators('Rework the navigation component')).toBe(true)
		expect(containsTaskIndicators('Make an adjustment to the layout')).toBe(true)
	})

	it('should return false when text does not contain task indicators', () => {
		// Test with non-task related text
		expect(containsTaskIndicators('Fix the login bug')).toBe(false)
		expect(containsTaskIndicators('Add a new feature')).toBe(false)
		expect(containsTaskIndicators('Create a user management system')).toBe(false)
		expect(containsTaskIndicators('')).toBe(false)
	})
})
