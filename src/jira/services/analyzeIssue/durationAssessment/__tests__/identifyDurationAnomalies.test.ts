import { checkIssueTypeTimeline } from '../anomalies/checkIssueTypeTimeline'
import { checkLongDuration } from '../anomalies/checkLongDuration'
import { checkSprintBoundaries } from '../anomalies/checkSprintBoundaries'
import { checkStatusCycling } from '../anomalies/checkStatusCycling'
import { checkVelocityIssues } from '../anomalies/checkVelocityIssues'
import { identifyDurationAnomalies } from '../identifyDurationAnomalies'
import type { JiraIssue } from '../../../../types/issue.types'

jest.mock('../anomalies/checkLongDuration')
jest.mock('../anomalies/checkSprintBoundaries')
jest.mock('../anomalies/checkVelocityIssues')
jest.mock('../anomalies/checkStatusCycling')
jest.mock('../anomalies/checkIssueTypeTimeline')

describe('identifyDurationAnomalies', () => {
	const mockCheckLongDuration = checkLongDuration as jest.MockedFunction<typeof checkLongDuration>
	const mockCheckSprintBoundaries = checkSprintBoundaries as jest.MockedFunction<typeof checkSprintBoundaries>
	const mockCheckVelocityIssues = checkVelocityIssues as jest.MockedFunction<typeof checkVelocityIssues>
	const mockCheckStatusCycling = checkStatusCycling as jest.MockedFunction<typeof checkStatusCycling>
	const mockCheckIssueTypeTimeline = checkIssueTypeTimeline as jest.MockedFunction<typeof checkIssueTypeTimeline>

	const mockIssue = {
		fields: {
			issuetype: {
				name: 'Bug',
			},
		},
	} as unknown as JiraIssue

	beforeEach(() => {
		jest.resetAllMocks()
		mockCheckLongDuration.mockReturnValue(null)
		mockCheckSprintBoundaries.mockReturnValue(null)
		mockCheckVelocityIssues.mockReturnValue([])
		mockCheckStatusCycling.mockReturnValue(null)
		mockCheckIssueTypeTimeline.mockReturnValue([])
	})

	it('should call all check functions with correct parameters', () => {
		identifyDurationAnomalies(mockIssue, 8, 1, 2.5, 2)

		expect(mockCheckLongDuration).toHaveBeenCalledWith(8)
		expect(mockCheckSprintBoundaries).toHaveBeenCalledWith(1)
		expect(mockCheckVelocityIssues).toHaveBeenCalledWith(2.5)
		expect(mockCheckStatusCycling).toHaveBeenCalledWith(2)
		expect(mockCheckIssueTypeTimeline).toHaveBeenCalledWith('Bug', 8)
	})

	it('should add anomaly from checkLongDuration when not null', () => {
		mockCheckLongDuration.mockReturnValue('Long in-progress duration (12 business days)')

		const result = identifyDurationAnomalies(mockIssue, 12, 0, 1.0, 0)

		expect(result).toContain('Long in-progress duration (12 business days)')
	})

	it('should add anomaly from checkSprintBoundaries when not null', () => {
		mockCheckSprintBoundaries.mockReturnValue('Issue reassigned across sprints 2 times')

		const result = identifyDurationAnomalies(mockIssue, 5, 2, 1.0, 0)

		expect(result).toContain('Issue reassigned across sprints 2 times')
	})

	it('should add anomalies from checkVelocityIssues', () => {
		mockCheckVelocityIssues.mockReturnValue(['Low velocity (0.3 points per day)'])

		const result = identifyDurationAnomalies(mockIssue, 5, 0, 0.3, 0)

		expect(result).toContain('Low velocity (0.3 points per day)')
	})

	it('should add anomaly from checkStatusCycling when not null', () => {
		mockCheckStatusCycling.mockReturnValue('Excessive status cycling (5 status revisits)')

		const result = identifyDurationAnomalies(mockIssue, 5, 0, 1.0, 5)

		expect(result).toContain('Excessive status cycling (5 status revisits)')
	})

	it('should add anomalies from checkIssueTypeTimeline', () => {
		mockCheckIssueTypeTimeline.mockReturnValue(['Bug fix taking longer than expected (7 days)'])

		const result = identifyDurationAnomalies(mockIssue, 7, 0, 1.0, 0)

		expect(result).toContain('Bug fix taking longer than expected (7 days)')
	})

	it('should combine all anomalies when multiple are present', () => {
		mockCheckLongDuration.mockReturnValue('Long in-progress duration (15 business days)')
		mockCheckSprintBoundaries.mockReturnValue('Issue reassigned across sprints 3 times')
		mockCheckVelocityIssues.mockReturnValue(['Low velocity (0.2 points per day)'])
		mockCheckStatusCycling.mockReturnValue('Excessive status cycling (6 status revisits)')
		mockCheckIssueTypeTimeline.mockReturnValue(['Bug fix taking longer than expected (15 days)'])

		const result = identifyDurationAnomalies(mockIssue, 15, 3, 0.2, 6)

		expect(result).toEqual([
			'Long in-progress duration (15 business days)',
			'Issue reassigned across sprints 3 times',
			'Low velocity (0.2 points per day)',
			'Excessive status cycling (6 status revisits)',
			'Bug fix taking longer than expected (15 days)',
		])
	})

	it('should return empty array when no anomalies are found', () => {
		const result = identifyDurationAnomalies(mockIssue, 5, 0, 1.0, 0)

		expect(result).toEqual([])
	})
})
