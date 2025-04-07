import { containsBugIndicators } from '../containsBugIndicators'

describe('containsBugIndicators', () => {
	it('should return true when text contains bug indicators', () => {
		// Test with various bug indicators
		expect(containsBugIndicators('This is a bug that needs fixing')).toBe(true)
		expect(containsBugIndicators('There is an error in the code')).toBe(true)
		expect(containsBugIndicators('The system crashes when clicking this button')).toBe(true)
		expect(containsBugIndicators('Found a defect in the login flow')).toBe(true)
		expect(containsBugIndicators('This feature is broken')).toBe(true)
		expect(containsBugIndicators('The calculation is incorrect')).toBe(true)
		expect(containsBugIndicators('The login is not working')).toBe(true)
		expect(containsBugIndicators('Tests are failing')).toBe(true)
		expect(containsBugIndicators('Getting an exception when loading')).toBe(true)
	})

	it('should return false when text does not contain bug indicators', () => {
		// Test with non-bug related text
		expect(containsBugIndicators('Add a new feature')).toBe(false)
		expect(containsBugIndicators('Implement user authentication')).toBe(false)
		expect(containsBugIndicators('Update the documentation')).toBe(false)
		expect(containsBugIndicators('')).toBe(false)
	})
})
