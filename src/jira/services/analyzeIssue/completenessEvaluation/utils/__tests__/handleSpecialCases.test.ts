import { handleSpecialCases } from '../handleSpecialCases'
import type { CategoryCheckResult } from '../../completenessEvaluation.types'

describe('handleSpecialCases', () => {
	const createCategoryResult = (present: boolean): CategoryCheckResult => ({
		missing: [],
		present,
		quality: present ? 'complete' : 'absent',
	})

	test('returns 1 when all categories are absent', () => {
		const result = handleSpecialCases(
			5, // initial score
			false, // isFrontend
			createCategoryResult(false), // acceptanceCriteria
			createCategoryResult(false), // technicalConstraints
			createCategoryResult(false), // dependencies
			createCategoryResult(false), // testingRequirements
			createCategoryResult(false), // designSpecifications
			createCategoryResult(false), // userImpact
		)
		expect(result).toBe(1)
	})

	test('returns 9 for non-frontend issue with design absent but all others present', () => {
		const result = handleSpecialCases(
			7, // initial score
			false, // isFrontend
			createCategoryResult(true), // acceptanceCriteria
			createCategoryResult(true), // technicalConstraints
			createCategoryResult(true), // dependencies
			createCategoryResult(true), // testingRequirements
			createCategoryResult(false), // designSpecifications
			createCategoryResult(true), // userImpact
		)
		expect(result).toBe(9)
	})

	test('returns original score for frontend issue with design absent and all others present', () => {
		const originalScore = 7
		const result = handleSpecialCases(
			originalScore,
			true, // isFrontend
			createCategoryResult(true), // acceptanceCriteria
			createCategoryResult(true), // technicalConstraints
			createCategoryResult(true), // dependencies
			createCategoryResult(true), // testingRequirements
			createCategoryResult(false), // designSpecifications
			createCategoryResult(true), // userImpact
		)
		expect(result).toBe(originalScore)
	})

	test('returns original score for non-frontend issue with design present and all others present', () => {
		const originalScore = 8
		const result = handleSpecialCases(
			originalScore,
			false, // isFrontend
			createCategoryResult(true), // acceptanceCriteria
			createCategoryResult(true), // technicalConstraints
			createCategoryResult(true), // dependencies
			createCategoryResult(true), // testingRequirements
			createCategoryResult(true), // designSpecifications
			createCategoryResult(true), // userImpact
		)
		expect(result).toBe(originalScore)
	})

	test('returns original score for mixed categories', () => {
		const originalScore = 6
		const result = handleSpecialCases(
			originalScore,
			false, // isFrontend
			createCategoryResult(true), // acceptanceCriteria
			createCategoryResult(false), // technicalConstraints
			createCategoryResult(true), // dependencies
			createCategoryResult(true), // testingRequirements
			createCategoryResult(false), // designSpecifications
			createCategoryResult(true), // userImpact
		)
		expect(result).toBe(originalScore)
	})
})
