import { isDesignSpecificationAbsent } from '../isDesignSpecificationAbsent'
import type { CategoryCheckResult } from '../../completenessEvaluation.types'

describe('isDesignSpecificationAbsent', () => {
	const createCategoryResult = (present: boolean): CategoryCheckResult => ({
		missing: [],
		present,
		quality: present ? 'complete' : 'absent',
	})

	test('returns true when design specifications are absent', () => {
		const result = isDesignSpecificationAbsent(createCategoryResult(false))
		expect(result).toBe(true)
	})

	test('returns false when design specifications are present', () => {
		const result = isDesignSpecificationAbsent(createCategoryResult(true))
		expect(result).toBe(false)
	})
})
