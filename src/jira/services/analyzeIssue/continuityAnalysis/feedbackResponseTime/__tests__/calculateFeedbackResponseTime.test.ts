import { calculateFeedbackResponseTime } from '../calculateFeedbackResponseTime'
import * as questionResponsePairsModule from '../questionResponsePairs'

// Mock the entire module
jest.mock('../questionResponsePairs')

describe('calculateFeedbackResponseTime', () => {
	const mockedIdentifyQuestionResponsePairs = questionResponsePairsModule.identifyQuestionResponsePairs as jest.Mock

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return 0 when no question-response pairs are found', () => {
		// Setup
		mockedIdentifyQuestionResponsePairs.mockReturnValue([])
		const mockCommentResponse = { comments: [] } as unknown as any

		// Execute
		const result = calculateFeedbackResponseTime(mockCommentResponse)

		// Verify
		expect(result).toBe(0)
		expect(mockedIdentifyQuestionResponsePairs).toHaveBeenCalledWith(mockCommentResponse)
	})

	it('should calculate the average response time correctly', () => {
		// Setup
		const mockPairs = [{ responseTimeHours: 1 }, { responseTimeHours: 2 }, { responseTimeHours: 3 }] as unknown as any[]

		mockedIdentifyQuestionResponsePairs.mockReturnValue(mockPairs)
		const mockCommentResponse = { comments: ['comment1', 'comment2'] } as unknown as any

		// Execute
		const result = calculateFeedbackResponseTime(mockCommentResponse)

		// Verify
		expect(result).toBe(2) // Average of 1, 2, 3
		expect(mockedIdentifyQuestionResponsePairs).toHaveBeenCalledWith(mockCommentResponse)
	})
})
