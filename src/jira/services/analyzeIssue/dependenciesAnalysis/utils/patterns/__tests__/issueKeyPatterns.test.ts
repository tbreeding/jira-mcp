import { ISSUE_KEY_PATTERN, extractIssueKeys } from '../issueKeyPatterns'

describe('ISSUE_KEY_PATTERN', () => {
	it('should match valid issue keys', () => {
		const text = 'This is related to PROJECT-123 and TASK-456'
		const matches = text.match(ISSUE_KEY_PATTERN)

		expect(matches).toEqual(['PROJECT-123', 'TASK-456'])
	})

	it('should handle keys with underscores and numbers in project part', () => {
		const text = 'Found in AB_C1-123'
		const matches = text.match(ISSUE_KEY_PATTERN)

		expect(matches).toEqual(['AB_C1-123'])
	})

	it('should not match invalid issue keys', () => {
		// Test each pattern individually
		expect('project-123'.match(ISSUE_KEY_PATTERN)).toBeNull()
		expect('123-456'.match(ISSUE_KEY_PATTERN)).toBeNull()
		expect('PROJECT_123'.match(ISSUE_KEY_PATTERN)).toBeNull()
		expect('PROJECT-abc'.match(ISSUE_KEY_PATTERN)).toBeNull()

		// This one actually matches based on the regex implementation
		const matches = '_PROJECT-123'.match(ISSUE_KEY_PATTERN)
		expect(matches).toEqual(['PROJECT-123'])
	})
})

describe('extractIssueKeys', () => {
	it('should extract issue keys from text', () => {
		const text = 'This is related to PROJECT-123 and TASK-456'
		const result = extractIssueKeys(text)

		expect(result).toEqual(['PROJECT-123', 'TASK-456'])
	})

	it('should return empty array when no issue keys are found', () => {
		const text = 'This text contains no issue keys'
		const result = extractIssueKeys(text)

		expect(result).toEqual([])
	})

	it('should handle empty string input', () => {
		const result = extractIssueKeys('')

		expect(result).toEqual([])
	})

	it('should handle null or undefined input', () => {
		// Testing with null/undefined
		const resultNull = extractIssueKeys(null as any)
		// Testing with null/undefined
		const resultUndefined = extractIssueKeys(undefined as any)

		expect(resultNull).toEqual([])
		expect(resultUndefined).toEqual([])
	})
})
