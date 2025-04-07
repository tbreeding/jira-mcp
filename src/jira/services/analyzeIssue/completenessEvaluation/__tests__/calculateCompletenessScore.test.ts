import { calculateCompletenessScore } from '../calculateCompletenessScore'
import type { CategoryCheckResult } from '../completenessEvaluation.types'

describe('calculateCompletenessScore', () => {
	// Helper to create default CategoryCheckResult
	function createCategory(overrides: Partial<CategoryCheckResult> = {}): CategoryCheckResult {
		return {
			missing: [],
			present: true,
			quality: 'complete',
			...overrides,
		}
	}

	it('should return 10 when all categories are complete', () => {
		const result = calculateCompletenessScore(
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory(),
			'Task',
		)

		expect(result).toBe(10)
	})

	it('should deduct points for absent categories', () => {
		const result = calculateCompletenessScore(
			createCategory({ present: false }),
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory(),
			'Task',
		)

		// Base 10 - 2 points (acceptanceCriteria weight)
		expect(result).toBe(8)
	})

	it('should deduct half points for partial categories', () => {
		const result = calculateCompletenessScore(
			createCategory({ quality: 'partial' }),
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory(),
			'Task',
		)

		// Base 10 - 1 point (half of acceptanceCriteria weight)
		expect(result).toBe(9)
	})

	it('should handle all categories being absent', () => {
		const result = calculateCompletenessScore(
			createCategory({ present: false }),
			createCategory({ present: false }),
			createCategory({ present: false }),
			createCategory({ present: false }),
			createCategory({ present: false }),
			createCategory({ present: false }),
			'Task',
		)

		// This would be below 1, but should be capped at 1
		expect(result).toBe(1)
	})

	it('should apply higher weight for design specifications on frontend issues', () => {
		// Test with design specifications absent for frontend issue
		const frontendResult = calculateCompletenessScore(
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory({ present: false }),
			createCategory(),
			'UI Task',
		)

		// Base 10 - 2 points (higher designSpecifications weight for frontend)
		expect(frontendResult).toBe(8)

		// Test with design specifications absent for non-frontend issue
		const nonFrontendResult = calculateCompletenessScore(
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory({ present: false }),
			createCategory(),
			'Backend Task',
		)

		// Base 10 - 1 point (regular designSpecifications weight)
		expect(nonFrontendResult).toBe(9)
	})

	it('should handle different frontend issue types', () => {
		const frontendTypes = ['UI', 'Frontend', 'Interface', 'Design', 'UX']

		frontendTypes.forEach((type) => {
			const result = calculateCompletenessScore(
				createCategory(),
				createCategory(),
				createCategory(),
				createCategory(),
				createCategory({ present: false }),
				createCategory(),
				`${type} Task`,
			)

			// Base 10 - 2 points (higher designSpecifications weight for frontend)
			expect(result).toBe(8)
		})
	})

	it('should correctly handle partial technical constraints', () => {
		const result = calculateCompletenessScore(
			createCategory(),
			createCategory({ quality: 'partial' }),
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory(),
			'Task',
		)

		// Base 10 - 0.75 points (half of technicalConstraints weight 1.5)
		expect(result).toBe(9)
	})

	it('should correctly handle partial dependencies', () => {
		const result = calculateCompletenessScore(
			createCategory(),
			createCategory(),
			createCategory({ quality: 'partial' }),
			createCategory(),
			createCategory(),
			createCategory(),
			'Task',
		)

		// Base 10 - 0.75 points (half of dependencies weight 1.5)
		expect(result).toBe(9)
	})

	it('should correctly handle partial testing requirements', () => {
		const result = calculateCompletenessScore(
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory({ quality: 'partial' }),
			createCategory(),
			createCategory(),
			'Task',
		)

		// Base 10 - 0.75 points (half of testingRequirements weight 1.5)
		expect(result).toBe(9)
	})

	it('should correctly handle partial user impact', () => {
		const result = calculateCompletenessScore(
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory({ quality: 'partial' }),
			'Task',
		)

		// Base 10 - 0.75 points (half of userImpact weight 1.5)
		expect(result).toBe(9)
	})

	it('should correctly handle partial design specifications', () => {
		// Test with partial design specifications for frontend issue
		const frontendResult = calculateCompletenessScore(
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory({ quality: 'partial' }),
			createCategory(),
			'UI Task',
		)

		// Base 10 - 1 point (half of designSpecifications weight 2 for frontend)
		expect(frontendResult).toBe(9)

		// Test with partial design specifications for non-frontend issue
		const nonFrontendResult = calculateCompletenessScore(
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory(),
			createCategory({ quality: 'partial' }),
			createCategory(),
			'Backend Task',
		)

		// Base 10 - 0.5 points (half of designSpecifications weight 1)
		// Since the deduction is small and the function rounds the score, we expect 10
		expect(nonFrontendResult).toBe(10)
	})
})
