import { isFrontendComponent } from './isFrontendComponent'

describe('isFrontendComponent', () => {
	it('should return true for frontend-related components', () => {
		expect(isFrontendComponent('Frontend')).toBe(true)
		expect(isFrontendComponent('frontend-team')).toBe(true)
		expect(isFrontendComponent('web-frontend')).toBe(true)
	})

	it('should return true for UI-related components', () => {
		expect(isFrontendComponent('UI')).toBe(true)
		expect(isFrontendComponent('ui-components')).toBe(true)
		expect(isFrontendComponent('design-ui')).toBe(true)
	})

	it('should return true for interface-related components', () => {
		expect(isFrontendComponent('Interface')).toBe(true)
		expect(isFrontendComponent('user-interface')).toBe(true)
		expect(isFrontendComponent('web-interface')).toBe(true)
	})

	it('should return false for unrelated components', () => {
		expect(isFrontendComponent('Backend')).toBe(false)
		expect(isFrontendComponent('API')).toBe(false)
		expect(isFrontendComponent('Database')).toBe(false)
		expect(isFrontendComponent('DevOps')).toBe(false)
	})
})
