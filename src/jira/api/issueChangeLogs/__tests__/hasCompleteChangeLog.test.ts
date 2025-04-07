import { hasCompleteChangeLog } from '../hasCompleteChangeLog'
import type { IssueChangeLog } from '../../../types/issue.types'

describe('repositories/jiraApi/issueChangeLogs/hasCompleteChangeLog', function () {
	it('returns true when the complete change log is returned with the issue', function () {
		expect(hasCompleteChangeLog({ total: 5, maxResults: 5 } as unknown as IssueChangeLog)).toBe(true)
	})

	it('returns false when the there are more change log items than were returned with the initial response', function () {
		expect(hasCompleteChangeLog({ total: 6, maxResults: 5 } as unknown as IssueChangeLog)).toBe(false)
	})
})
