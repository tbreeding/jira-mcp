import { checkTechnicalConstraints } from '../checkTechnicalConstraints'

describe('checkTechnicalConstraints', () => {
	it('should identify absence of technical constraints', () => {
		const result = checkTechnicalConstraints('Some text without any technical details')

		expect(result.present).toBe(false)
		expect(result.quality).toBe('absent')
		expect(result.missing).toEqual(['Technical constraints not specified'])
	})

	it('should identify presence of technical constraints from a single pattern', () => {
		const result = checkTechnicalConstraints('Technical constraints: The application must handle high traffic.')

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
		expect(result.missing).toEqual([])
	})

	it('should identify presence of technical constraints from different patterns with partial quality', () => {
		const result = checkTechnicalConstraints('We need to consider browser compatibility for IE11.')

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
		expect(result.missing).toEqual([])
	})

	it('should identify complete quality when multiple constraint patterns are mentioned', () => {
		const text = `
      Technical requirements: 
      - The system must support high concurrent users
      - Browser compatibility with Chrome, Firefox, and Safari
      - Security requirements include data encryption
    `

		const result = checkTechnicalConstraints(text)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('complete')
		expect(result.missing).toEqual([])
	})

	it('should identify presence for performance requirements', () => {
		const result = checkTechnicalConstraints('Performance requirements: response time < 200ms')

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
		expect(result.missing).toEqual([])
	})

	it('should identify presence for device support', () => {
		const result = checkTechnicalConstraints('Device compatibility must include Android 10+ and iOS 13+')

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
		expect(result.missing).toEqual([])
	})

	it('should identify presence for environment requirements', () => {
		const result = checkTechnicalConstraints('Environment setup requires Node.js 16+')

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
		expect(result.missing).toEqual([])
	})

	it('should identify presence for dependencies', () => {
		const result = checkTechnicalConstraints('Dependencies on third-party services must be considered')

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
		expect(result.missing).toEqual([])
	})

	it('should identify presence for version requirements', () => {
		const result = checkTechnicalConstraints('Version compatibility with the existing API is required')

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
		expect(result.missing).toEqual([])
	})
})
