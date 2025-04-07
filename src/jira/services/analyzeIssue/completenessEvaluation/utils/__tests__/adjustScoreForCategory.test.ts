import { adjustScoreForCategory } from '../adjustScoreForCategory'
import type { CategoryCheckResult } from '../../completenessEvaluation.types'

describe('adjustScoreForCategory', function () {
	const baseScore = 10
	const weight = 2

	it('reduces score by full weight when category is required but not present', function () {
		const result: CategoryCheckResult = {
			present: false,
			quality: 'absent',
			missing: ['Some criteria'],
		}

		expect(adjustScoreForCategory(baseScore, result, weight, true)).toBe(8)
	})

	it('reduces score by half weight when category is required but only partially complete', function () {
		const result: CategoryCheckResult = {
			present: true,
			quality: 'partial',
			missing: ['Some criteria'],
		}

		expect(adjustScoreForCategory(baseScore, result, weight, true)).toBe(9)
	})

	it('does not reduce score when category is required and complete', function () {
		const result: CategoryCheckResult = {
			present: true,
			quality: 'complete',
			missing: [],
		}

		expect(adjustScoreForCategory(baseScore, result, weight, true)).toBe(10)
	})

	it('does not reduce score when category is not required, regardless of presence', function () {
		const absentResult: CategoryCheckResult = {
			present: false,
			quality: 'absent',
			missing: ['Some criteria'],
		}

		expect(adjustScoreForCategory(baseScore, absentResult, weight, false)).toBe(10)

		const partialResult: CategoryCheckResult = {
			present: true,
			quality: 'partial',
			missing: ['Some criteria'],
		}

		expect(adjustScoreForCategory(baseScore, partialResult, weight, false)).toBe(10)

		const completeResult: CategoryCheckResult = {
			present: true,
			quality: 'complete',
			missing: [],
		}

		expect(adjustScoreForCategory(baseScore, completeResult, weight, false)).toBe(10)
	})
})
