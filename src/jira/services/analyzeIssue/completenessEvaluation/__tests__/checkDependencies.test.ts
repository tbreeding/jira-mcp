import { checkDependencies } from '../checkDependencies'
import type { JiraIssue } from '../../../../types/issue.types'

describe('checkDependencies', () => {
	it('should identify absence of dependencies', () => {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const result = checkDependencies('Some text without any related information', mockIssue)

		expect(result.present).toBe(false)
		expect(result.quality).toBe('absent')
		expect(result.missing).toContain('Dependencies not identified')
	})

	it('should identify presence of dependencies from text patterns', () => {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const result = checkDependencies('This task depends on PR #123 being merged', mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
		expect(result.missing).toEqual([])
	})

	it('should identify presence of dependencies from linked issues without explicit relationship type', () => {
		const mockIssue = {
			fields: {
				issuelinks: [
					{
						type: { name: 'Other' },
					},
				],
			},
		} as unknown as JiraIssue

		const result = checkDependencies('Some text without mentions', mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
		expect(result.missing).toEqual([])
	})

	it('should identify complete quality for explicitly linked dependencies', () => {
		const mockIssue = {
			fields: {
				issuelinks: [
					{
						type: { name: 'Blocks' },
					},
				],
			},
		} as unknown as JiraIssue

		const result = checkDependencies('Some text', mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('complete')
		expect(result.missing).toEqual([])
	})

	it('should recognize "blocked by" pattern', () => {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const result = checkDependencies('This task is blocked by PROJ-123', mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
	})

	it('should recognize "prerequisite" pattern', () => {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const result = checkDependencies('The prerequisite for this task is PROJ-123', mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
	})

	it('should recognize "depends on" relationship type', () => {
		const mockIssue = {
			fields: {
				issuelinks: [
					{
						type: { name: 'Depends on' },
					},
				],
			},
		} as unknown as JiraIssue

		const result = checkDependencies('Some text', mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('complete')
	})

	it('should recognize "relates to" relationship type', () => {
		const mockIssue = {
			fields: {
				issuelinks: [
					{
						type: { name: 'Relates to' },
					},
				],
			},
		} as unknown as JiraIssue

		const result = checkDependencies('Some text', mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('complete')
	})
})
