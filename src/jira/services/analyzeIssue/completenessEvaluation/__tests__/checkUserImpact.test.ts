import { checkUserImpact } from '../checkUserImpact'

describe('checkUserImpact', () => {
	it('should identify absence of user impact considerations', () => {
		const result = checkUserImpact('Some text without any relevant information')

		expect(result.present).toBe(false)
		expect(result.quality).toBe('absent')
		expect(result.missing).toContain('User impact considerations not documented')
	})

	it('should identify presence of user impact with single pattern match', () => {
		const result = checkUserImpact('This change has user impact on the login workflow')

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
		expect(result.missing).toEqual([])
	})

	it('should identify partial quality with two pattern matches', () => {
		const text = `
      This change has user impact on the login workflow.
      We need to consider accessibility implications.
    `

		const result = checkUserImpact(text)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
		expect(result.missing).toEqual([])
	})

	it('should identify complete quality with three or more pattern matches', () => {
		const text = `
      This change has user impact on the login workflow.
      We need to consider accessibility implications.
      This will affect the user experience significantly.
      Admin user group will be affected most.
    `

		const result = checkUserImpact(text)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('complete')
		expect(result.missing).toEqual([])
	})

	it('should recognize "accessibility" pattern', () => {
		const result = checkUserImpact('This change has accessibility implications')

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
	})

	it('should recognize "a11y" pattern', () => {
		const result = checkUserImpact('We need to ensure good a11y support')

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
	})

	it('should recognize "user role" pattern', () => {
		const result = checkUserImpact('This will affect users with admin user role')

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
	})

	it('should recognize "user experience" pattern', () => {
		const result = checkUserImpact('The change will improve user experience')

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
	})

	it('should recognize "customer impact" pattern', () => {
		const result = checkUserImpact('This change has customer impact on enterprise users')

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
	})
})
