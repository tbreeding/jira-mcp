import { areAllCategoriesAbsent } from '../areAllCategoriesAbsent'
import type { CategoryCheckResult } from '../../completenessEvaluation.types'

describe('areAllCategoriesAbsent', () => {
	const createCategoryResult = (present: boolean): CategoryCheckResult => ({
		missing: [],
		present,
		quality: present ? 'complete' : 'absent',
	})

	test('returns true when all categories are absent', () => {
		const result = areAllCategoriesAbsent(
			createCategoryResult(false),
			createCategoryResult(false),
			createCategoryResult(false),
			createCategoryResult(false),
			createCategoryResult(false),
			createCategoryResult(false),
		)
		expect(result).toBe(true)
	})

	test('returns false when at least one category is present', () => {
		const result = areAllCategoriesAbsent(
			createCategoryResult(true),
			createCategoryResult(false),
			createCategoryResult(false),
			createCategoryResult(false),
			createCategoryResult(false),
			createCategoryResult(false),
		)
		expect(result).toBe(false)
	})

	test('returns false when all categories are present', () => {
		const result = areAllCategoriesAbsent(
			createCategoryResult(true),
			createCategoryResult(true),
			createCategoryResult(true),
			createCategoryResult(true),
			createCategoryResult(true),
			createCategoryResult(true),
		)
		expect(result).toBe(false)
	})
})
