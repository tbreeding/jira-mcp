import { extractDependencyName } from '../extractionStrategies'
import { findDependencies, processWordsForDependencies } from '../findDependencies'

// Mock the extractionStrategies module
jest.mock('../extractionStrategies', () => ({
	extractDependencyName: jest.fn(),
}))

const mockExtractDependencyName = extractDependencyName as jest.MockedFunction<typeof extractDependencyName>

describe('findDependencies', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('should return empty array for empty text', () => {
		const result = findDependencies('', ['indicator'])
		expect(result).toEqual([])
	})

	test('should return empty array for null text', () => {
		const result = findDependencies(null as unknown as string, ['indicator'])
		expect(result).toEqual([])
	})

	test('should return empty array for empty indicators', () => {
		const result = findDependencies('test text', [])
		expect(result).toEqual([])
	})

	test('should return empty array for null indicators', () => {
		const result = findDependencies('test text', null as unknown as string[])
		expect(result).toEqual([])
	})

	test('should find dependencies in text', () => {
		mockExtractDependencyName.mockImplementation((words, index) => {
			return `${words[index]} dependency`
		})

		const result = findDependencies('test indicator other', ['indicator'])

		expect(mockExtractDependencyName).toHaveBeenCalledWith(['test', 'indicator', 'other'], 1)
		expect(result).toEqual(['indicator dependency'])
	})

	test('should find multiple dependencies in text', () => {
		mockExtractDependencyName.mockImplementation((words, index) => {
			return `${words[index]} dependency`
		})

		const result = findDependencies('first indicator second indicator', ['indicator'])

		expect(mockExtractDependencyName).toHaveBeenCalledTimes(2)
		expect(result).toEqual(['indicator dependency'])
	})

	test('should find dependencies from multiple indicators', () => {
		mockExtractDependencyName.mockImplementation((words, index) => {
			return `${words[index]} dependency`
		})

		const result = findDependencies('first indicator other signal', ['indicator', 'signal'])

		expect(mockExtractDependencyName).toHaveBeenCalledTimes(2)
		expect(result).toEqual(['indicator dependency', 'signal dependency'])
	})

	test('should return empty array if no dependencies found', () => {
		mockExtractDependencyName.mockReturnValue(null)

		const result = findDependencies('test indicator other', ['indicator'])

		expect(mockExtractDependencyName).toHaveBeenCalledWith(['test', 'indicator', 'other'], 1)
		expect(result).toEqual([])
	})
})

describe('processWordsForDependencies', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('should not process empty words array', () => {
		const dependencies = new Set<string>()
		processWordsForDependencies([], ['indicator'], dependencies)

		expect(mockExtractDependencyName).not.toHaveBeenCalled()
		expect(dependencies.size).toBe(0)
	})

	test('should not process when no indicators match', () => {
		const dependencies = new Set<string>()
		processWordsForDependencies(['test', 'words'], ['indicator'], dependencies)

		expect(mockExtractDependencyName).not.toHaveBeenCalled()
		expect(dependencies.size).toBe(0)
	})

	test('should process words and add dependency when found', () => {
		mockExtractDependencyName.mockReturnValue('found dependency')

		const dependencies = new Set<string>()
		processWordsForDependencies(['test', 'indicator', 'words'], ['indicator'], dependencies)

		expect(mockExtractDependencyName).toHaveBeenCalledWith(['test', 'indicator', 'words'], 1)
		expect(dependencies.size).toBe(1)
		expect(dependencies.has('found dependency')).toBe(true)
	})

	test('should not add dependency when not found', () => {
		mockExtractDependencyName.mockReturnValue(null)

		const dependencies = new Set<string>()
		processWordsForDependencies(['test', 'indicator', 'words'], ['indicator'], dependencies)

		expect(mockExtractDependencyName).toHaveBeenCalledWith(['test', 'indicator', 'words'], 1)
		expect(dependencies.size).toBe(0)
	})

	test('should process multiple indicators', () => {
		mockExtractDependencyName.mockReturnValueOnce('first dependency').mockReturnValueOnce('second dependency')

		const dependencies = new Set<string>()
		processWordsForDependencies(['test', 'first', 'middle', 'second', 'end'], ['first', 'second'], dependencies)

		expect(mockExtractDependencyName).toHaveBeenCalledTimes(2)
		expect(dependencies.size).toBe(2)
		expect(dependencies.has('first dependency')).toBe(true)
		expect(dependencies.has('second dependency')).toBe(true)
	})
})
