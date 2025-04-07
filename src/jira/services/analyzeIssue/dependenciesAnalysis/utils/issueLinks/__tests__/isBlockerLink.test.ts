import { isBlockerLink } from '../isBlockerLink'
import type { IssueLink } from '../../../../../../types/issue.types'

describe('isBlockerLink', () => {
	it('should return true for a link with "Blocks" name', () => {
		const link = {
			type: {
				name: 'Blocks',
				inward: 'is blocked by',
				outward: 'blocks',
			},
		} as IssueLink

		expect(isBlockerLink(link)).toBe(true)
	})

	it('should return true for a link with "Blocked by" name', () => {
		const link = {
			type: {
				name: 'Blocked by',
				inward: 'is blocked by',
				outward: 'blocks',
			},
		} as IssueLink

		expect(isBlockerLink(link)).toBe(true)
	})

	it('should return true for a link with "is blocked by" inward relation', () => {
		const link = {
			type: {
				name: 'CustomBlocker',
				inward: 'is blocked by',
				outward: 'blocks',
			},
		} as IssueLink

		expect(isBlockerLink(link)).toBe(true)
	})

	it('should return false for a non-blocker link', () => {
		const link = {
			type: {
				name: 'Related',
				inward: 'relates to',
				outward: 'relates to',
			},
		} as IssueLink

		expect(isBlockerLink(link)).toBe(false)
	})

	it('should return false for a link with no type', () => {
		const link = {} as IssueLink

		expect(isBlockerLink(link)).toBe(false)
	})
})
