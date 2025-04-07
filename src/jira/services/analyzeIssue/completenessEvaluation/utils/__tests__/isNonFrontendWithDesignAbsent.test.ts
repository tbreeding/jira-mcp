import { isNonFrontendWithDesignAbsent } from '../isNonFrontendWithDesignAbsent'
import type { CategoryCheckResult } from '../../completenessEvaluation.types'

describe('isNonFrontendWithDesignAbsent', () => {
	const createCategoryResult = (present: boolean): CategoryCheckResult => ({
		missing: [],
		present,
		quality: present ? 'complete' : 'absent',
	})

	test('returns true for non-frontend issue with design absent and other categories present', () => {
		const isFrontend = false
		const designSpec = createCategoryResult(false)
		const otherCategoriesPresent = true

		const result = isNonFrontendWithDesignAbsent(isFrontend, designSpec, otherCategoriesPresent)

		expect(result).toBe(true)
	})

	test('returns false for frontend issue with design absent and other categories present', () => {
		const isFrontend = true
		const designSpec = createCategoryResult(false)
		const otherCategoriesPresent = true

		const result = isNonFrontendWithDesignAbsent(isFrontend, designSpec, otherCategoriesPresent)

		expect(result).toBe(false)
	})

	test('returns false for non-frontend issue with design present and other categories present', () => {
		const isFrontend = false
		const designSpec = createCategoryResult(true)
		const otherCategoriesPresent = true

		const result = isNonFrontendWithDesignAbsent(isFrontend, designSpec, otherCategoriesPresent)

		expect(result).toBe(false)
	})

	test('returns false for non-frontend issue with design absent but other categories not all present', () => {
		const isFrontend = false
		const designSpec = createCategoryResult(false)
		const otherCategoriesPresent = false

		const result = isNonFrontendWithDesignAbsent(isFrontend, designSpec, otherCategoriesPresent)

		expect(result).toBe(false)
	})
})
