import { createInvalidIssueLink } from '../createInvalidIssueLink'

describe('createInvalidIssueLink', () => {
	it('should create a linked issue with "No data available" summary when given an empty object', () => {
		const emptyIssue = {}
		const relationship = 'blocks'

		const result = createInvalidIssueLink(emptyIssue, relationship)

		expect(result).toEqual({
			key: 'unknown',
			summary: 'No data available',
			relationship: 'blocks',
		})
	})

	it('should create a linked issue with "No summary available" summary when given a non-empty object', () => {
		const nonEmptyIssue = { id: '123' }
		const relationship = 'relates to'

		const result = createInvalidIssueLink(nonEmptyIssue, relationship)

		expect(result).toEqual({
			key: 'unknown',
			summary: 'No summary available',
			relationship: 'relates to',
		})
	})
})
