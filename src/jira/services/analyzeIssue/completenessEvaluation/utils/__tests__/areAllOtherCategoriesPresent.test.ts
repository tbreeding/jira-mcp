import { areAllOtherCategoriesPresent } from '../areAllOtherCategoriesPresent'
import type { CategoryCheckResult } from '../../completenessEvaluation.types'

describe('areAllOtherCategoriesPresent', () => {
	const createCategoryResult = (present: boolean): CategoryCheckResult => ({
		missing: [],
		present,
		quality: present ? 'complete' : 'absent',
	})

	test('returns true when all categories are present', () => {
		const result = areAllOtherCategoriesPresent(
			createCategoryResult(true),
			createCategoryResult(true),
			createCategoryResult(true),
			createCategoryResult(true),
			createCategoryResult(true),
		)
		expect(result).toBe(true)
	})

	test('returns false when at least one category is absent', () => {
		const result = areAllOtherCategoriesPresent(
			createCategoryResult(true),
			createCategoryResult(false),
			createCategoryResult(true),
			createCategoryResult(true),
			createCategoryResult(true),
		)
		expect(result).toBe(false)
	})

	test('returns false when all categories are absent', () => {
		const result = areAllOtherCategoriesPresent(
			createCategoryResult(false),
			createCategoryResult(false),
			createCategoryResult(false),
			createCategoryResult(false),
			createCategoryResult(false),
		)
		expect(result).toBe(false)
	})
})
