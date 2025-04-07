import { checkAcceptanceCriteria } from '../checkAcceptanceCriteria'
import type { JiraIssue } from '../../../../types/issue.types'

describe('checkAcceptanceCriteria', () => {
	it('should identify absence of acceptance criteria', () => {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const result = checkAcceptanceCriteria('Some text without any matching patterns', mockIssue)

		expect(result.present).toBe(false)
		expect(result.quality).toBe('absent')
		expect(result.missing).toContain('Acceptance criteria not found')
	})

	it('should identify presence of acceptance criteria with pattern match', () => {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const result = checkAcceptanceCriteria('Here are the acceptance criteria for this task', mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
		expect(result.missing).toEqual([])
	})

	it('should identify presence of acceptance criteria with custom field', () => {
		const mockIssue = {
			fields: {
				customfield_10101: 'Custom field acceptance criteria',
			},
		} as unknown as JiraIssue

		const result = checkAcceptanceCriteria('Some text without any patterns', mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
		expect(result.missing).toEqual([])
	})

	it('should identify multiple acceptance criteria patterns as complete', () => {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const text = `
      These are the acceptance criteria for this task.
      Given a user is logged in, When they click submit, Then the form should save.
      The definition of done includes passing all tests.
    `

		const result = checkAcceptanceCriteria(text, mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('complete')
		expect(result.missing).toEqual([])
	})

	it('should recognize "given when then" pattern', () => {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const result = checkAcceptanceCriteria(
			'Given the user is on the login page, When they enter their credentials, Then they should be logged in',
			mockIssue,
		)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
	})

	it('should recognize "success criteria" pattern', () => {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const result = checkAcceptanceCriteria('The success criteria for this task is user satisfaction', mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
	})

	it('should recognize "definition of done" pattern', () => {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const result = checkAcceptanceCriteria('The definition of done includes all unit tests passing', mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
	})

	it('should recognize "acceptance test" pattern', () => {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const result = checkAcceptanceCriteria('The acceptance test will verify this functionality', mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
	})

	it('should recognize "should be able to" pattern', () => {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const result = checkAcceptanceCriteria('The user should be able to submit the form', mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
	})
})
