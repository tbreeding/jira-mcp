import { generateSuggestions } from '../generateSuggestions'
import type { ContextualRequirements } from '../types/contextualRequirements.types'

describe('generateSuggestions', () => {
	it('should generate suggestions for missing acceptance criteria', () => {
		const missingInfo = ['Acceptance criteria not found']
		const result = generateSuggestions(missingInfo, 'Task')

		expect(result).toContain('Add specific acceptance criteria using Given/When/Then format')
		expect(result).toContain('Define measurable outcomes for each feature aspect')
		expect(result.length).toBe(2)
	})

	it('should generate suggestions for missing technical constraints', () => {
		const missingInfo = ['Technical constraints not specified']
		const result = generateSuggestions(missingInfo, 'Task')

		expect(result).toContain('Specify performance requirements (e.g., expected response times)')
		expect(result).toContain('Document browser/device compatibility requirements')
		expect(result.length).toBe(2)
	})

	it('should generate suggestions for missing dependencies', () => {
		const missingInfo = ['Dependencies not identified']
		const result = generateSuggestions(missingInfo, 'Task')

		expect(result).toContain('Formally link blocking issues in Jira')
		expect(result).toContain('Specify external systems this implementation interacts with')
		expect(result.length).toBe(2)
	})

	it('should generate suggestions for missing testing requirements', () => {
		const missingInfo = ['Testing requirements not specified']
		const result = generateSuggestions(missingInfo, 'Task')

		expect(result).toContain('Document key test scenarios for QA')
		expect(result).toContain('Identify edge cases that require specific testing')
		expect(result.length).toBe(2)
	})

	it('should generate suggestions for missing design specifications', () => {
		const missingInfo = ['Design specifications not provided']
		const result = generateSuggestions(missingInfo, 'Task')

		expect(result).toContain('Attach wireframes or design mockups')
		expect(result).toContain('Link to relevant design system components')
		expect(result.length).toBe(2)
	})

	it('should generate different design suggestions for bugs', () => {
		const missingInfo = ['Design specifications not provided']
		const result = generateSuggestions(missingInfo, 'Bug')

		expect(result).toContain('Include screenshots of the current behavior if UI-related')
		expect(result).toContain('Describe the expected visual outcome')
		expect(result.length).toBe(2)
	})

	it('should respect contextual requirements for design specifications', () => {
		const missingInfo = ['Design specifications not provided']
		const contextualRequirements: ContextualRequirements = {
			needsDesignSpecifications: false,
			needsTechnicalConstraints: true,
			needsTestingRequirements: true,
			needsUserImpact: true,
		}

		const result = generateSuggestions(missingInfo, 'Task', contextualRequirements)

		// Should not add design suggestions when not required by context
		expect(result.length).toBe(0)
	})

	it('should generate UI-specific suggestions for UI-related issue types', () => {
		const missingInfo = ['Design specifications may be required if this involves UI changes']
		const result = generateSuggestions(missingInfo, 'UI Task')

		expect(result).toContain('Clarify if this issue involves UI changes and provide design specifications if needed')
		expect(result.length).toBe(1)
	})

	it('should not generate UI-specific suggestions for non-UI issue types', () => {
		const missingInfo = ['Design specifications may be required if this involves UI changes']
		const result = generateSuggestions(missingInfo, 'Backend Task')

		expect(result).not.toContain(
			'Clarify if this issue involves UI changes and provide design specifications if needed',
		)
		expect(result.length).toBe(0)
	})

	it('should generate suggestions for missing user impact considerations', () => {
		const missingInfo = ['User impact considerations not documented']
		const result = generateSuggestions(missingInfo, 'Task')

		expect(result).toContain('Describe user workflows affected by this change')
		expect(result).toContain('Specify accessibility requirements if applicable')
		expect(result.length).toBe(2)
	})

	it('should respect contextual requirements for user impact', () => {
		const missingInfo = ['User impact considerations not documented']
		const contextualRequirements: ContextualRequirements = {
			needsDesignSpecifications: true,
			needsTechnicalConstraints: true,
			needsTestingRequirements: true,
			needsUserImpact: false,
		}

		const result = generateSuggestions(missingInfo, 'Task', contextualRequirements)

		// Should not add user impact suggestions when not required by context
		expect(result.length).toBe(0)
	})

	it('should generate multiple suggestions for multiple missing information categories', () => {
		const missingInfo = [
			'Acceptance criteria not found',
			'Technical constraints not specified',
			'User impact considerations not documented',
		]
		const result = generateSuggestions(missingInfo, 'Task')

		expect(result.length).toBe(6) // 2 for each of the 3 categories
		expect(result).toContain('Add specific acceptance criteria using Given/When/Then format')
		expect(result).toContain('Specify performance requirements (e.g., expected response times)')
		expect(result).toContain('Describe user workflows affected by this change')
	})

	it('should recognize various UI-related issue types', () => {
		const uiRelatedTerms = ['UI', 'Frontend', 'Interface', 'Design', 'UX', 'Visual', 'Screen']
		const missingInfo = ['Design specifications may be required if this involves UI changes']

		uiRelatedTerms.forEach((term) => {
			const result = generateSuggestions(missingInfo, `${term} Task`)
			expect(result).toContain('Clarify if this issue involves UI changes and provide design specifications if needed')
			expect(result.length).toBe(1)
		})
	})

	it('should not identify UI-related terms in lower case', () => {
		// This covers the specific branch where the term.toLowerCase() comparison happens
		const missingInfo = ['Design specifications may be required if this involves UI changes']
		const issueTypeLower = 'ui task' // lowercase ui

		const result = generateSuggestions(missingInfo, issueTypeLower)

		// We should still detect "ui" as a UI term even in lowercase
		expect(result).toContain('Clarify if this issue involves UI changes and provide design specifications if needed')
		expect(result.length).toBe(1)
	})

	it('should use default requirements when none provided', () => {
		const missingInfo = ['Technical constraints not specified', 'Testing requirements not specified']
		const result = generateSuggestions(missingInfo, 'Task', undefined)

		// Should use default requirements and generate suggestions for all categories
		expect(result.length).toBe(4) // 2 for technical constraints + 2 for testing requirements
	})

	it('should return an empty array if no relevant missing information is provided', () => {
		const missingInfo = ['Some unrecognized missing information']
		const result = generateSuggestions(missingInfo, 'Task')

		expect(result).toEqual([])
	})
})
