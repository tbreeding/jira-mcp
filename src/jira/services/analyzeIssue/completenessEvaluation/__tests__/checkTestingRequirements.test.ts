import { checkTestingRequirements } from '../checkTestingRequirements'

describe('checkTestingRequirements', () => {
	it('should identify absence of testing requirements', () => {
		const result = checkTestingRequirements('Some text without any testing information')

		expect(result.present).toBe(false)
		expect(result.quality).toBe('absent')
		expect(result.missing).toContain('Testing requirements not specified')
	})

	it('should identify presence of testing requirements with single pattern match', () => {
		const result = checkTestingRequirements('The test case should verify login functionality')

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
		expect(result.missing).toEqual([])
	})

	it('should identify partial quality with two pattern matches', () => {
		const text = `
      The test case should verify login functionality.
      Consider edge cases for invalid inputs.
    `

		const result = checkTestingRequirements(text)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
		expect(result.missing).toEqual([])
	})

	it('should identify complete quality with three or more pattern matches', () => {
		const text = `
      The test case should verify login functionality.
      Consider edge cases for invalid inputs.
      We need a test plan to verify all scenarios.
      Include automated tests in the PR.
    `

		const result = checkTestingRequirements(text)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('complete')
		expect(result.missing).toEqual([])
	})

	it('should recognize "edge case" pattern', () => {
		const result = checkTestingRequirements('Consider edge cases for error handling')

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
	})

	it('should recognize "test plan" pattern', () => {
		const result = checkTestingRequirements('Create a test plan to verify this functionality')

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
	})

	it('should recognize "verification" pattern', () => {
		const result = checkTestingRequirements('Verification steps must be included')

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
	})

	it('should recognize "QA requirement" pattern', () => {
		const result = checkTestingRequirements('QA requirements include testing on all supported browsers')

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
	})

	it('should recognize "automated test" pattern', () => {
		const result = checkTestingRequirements('Automated tests should be included in the PR')

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
	})
})
