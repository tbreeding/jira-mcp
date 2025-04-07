import { extractDependencyName, checkWordsBefore, checkTwoWordsBefore, checkWordsAfter } from '../extractionStrategies'
import { isValidDependencyWord } from '../validators'

// Mock the validator module
jest.mock('../validators', () => ({
	isValidDependencyWord: jest.fn(),
}))

const mockIsValidDependencyWord = isValidDependencyWord as jest.MockedFunction<typeof isValidDependencyWord>

describe('extractionStrategies', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe('checkWordsBefore', () => {
		test('should return null if indicatorIndex is 0', () => {
			const result = checkWordsBefore(['test'], 0)
			expect(result).toBeNull()
		})

		test('should return null if previous word is invalid', () => {
			mockIsValidDependencyWord.mockReturnValue(false)
			const result = checkWordsBefore(['previous', 'indicator'], 1)

			expect(mockIsValidDependencyWord).toHaveBeenCalledWith('previous')
			expect(result).toBeNull()
		})

		test('should return dependency string if previous word is valid', () => {
			mockIsValidDependencyWord.mockReturnValue(true)
			const result = checkWordsBefore(['valid', 'indicator'], 1)

			expect(mockIsValidDependencyWord).toHaveBeenCalledWith('valid')
			expect(result).toBe('valid indicator')
		})
	})

	describe('checkTwoWordsBefore', () => {
		test('should return null if indicatorIndex is less than 2', () => {
			const result1 = checkTwoWordsBefore(['test'], 0)
			const result2 = checkTwoWordsBefore(['test', 'indicator'], 1)

			expect(result1).toBeNull()
			expect(result2).toBeNull()
		})

		test('should return null if two words before are too short', () => {
			const result = checkTwoWordsBefore(['a', 'b', 'indicator'], 2)
			expect(result).toBeNull()
		})

		test('should return dependency string if two words before are long enough', () => {
			const result = checkTwoWordsBefore(['valid', 'phrase', 'indicator'], 2)
			expect(result).toBe('valid phrase indicator')
		})
	})

	describe('checkWordsAfter', () => {
		test('should return null if indicatorIndex is at the end', () => {
			const result = checkWordsAfter(['indicator'], 0)
			expect(result).toBeNull()
		})

		test('should return null if next word is invalid', () => {
			mockIsValidDependencyWord.mockReturnValue(false)
			const result = checkWordsAfter(['indicator', 'invalid'], 0)

			expect(mockIsValidDependencyWord).toHaveBeenCalledWith('invalid')
			expect(result).toBeNull()
		})

		test('should return dependency string if next word is valid', () => {
			mockIsValidDependencyWord.mockReturnValue(true)
			const result = checkWordsAfter(['indicator', 'valid'], 0)

			expect(mockIsValidDependencyWord).toHaveBeenCalledWith('valid')
			expect(result).toBe('indicator valid')
		})
	})

	describe('extractDependencyName', () => {
		test('integration test with real dependencies - checkWordsBefore path', () => {
			// Override the mock for this specific test
			mockIsValidDependencyWord.mockImplementation((word) => word === 'valid')

			const words = ['valid', 'indicator', 'other']
			const result = extractDependencyName(words, 1)

			expect(result).toBe('valid indicator')
		})

		test('integration test with real dependencies - checkTwoWordsBefore path', () => {
			// Set up mocks for specific test paths
			mockIsValidDependencyWord.mockImplementation(() => false) // Make checkWordsBefore fail

			const words = ['first', 'second', 'indicator', 'other']
			const result = extractDependencyName(words, 2)

			// Since both words are considered "invalid", it will use the length check in checkTwoWordsBefore
			expect(result).toBe('first second indicator')
		})

		test('integration test with real dependencies - checkWordsAfter path', () => {
			// Set up mocks to make first two strategies fail, but checkWordsAfter succeed
			mockIsValidDependencyWord.mockImplementation((word) => word === 'valid')

			const words = ['indicator', 'valid']
			const result = extractDependencyName(words, 0)

			// Since indicatorIndex is 0, checkWordsBefore and checkTwoWordsBefore will fail
			// and checkWordsAfter will succeed because 'valid' is valid
			expect(result).toBe('indicator valid')
		})

		test('integration test with real dependencies - all checks fail', () => {
			// Make all validations fail
			mockIsValidDependencyWord.mockReturnValue(false)

			// Create a case where no strategy will succeed
			// - indicatorIndex 0 means checkWordsBefore and checkTwoWordsBefore will fail
			// - invalid next word means checkWordsAfter will fail
			const words = ['indicator']
			const result = extractDependencyName(words, 0)

			expect(result).toBeNull()
		})
	})
})
