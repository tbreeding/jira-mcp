import { MITIGATION_SUGGESTIONS } from '../../mitigationSuggestions'
import {
	addTechnicalRiskSuggestions,
	addQualityAndKnowledgeSuggestions,
	addTimelineAndPlanningSuggestions,
	addDependencySuggestions,
	addInformationRiskSuggestions,
} from '../mitigationCategoryHandlers'

describe('mitigationCategoryHandlers', () => {
	describe('addTechnicalRiskSuggestions', () => {
		test('should add technical debt suggestion when text contains relevant patterns', () => {
			const suggestions = new Set<string>()
			addTechnicalRiskSuggestions('this code has technical debt and needs refactoring', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.technicalDebt)).toBe(true)
		})

		test('should not add technical debt suggestion when text does not contain relevant patterns', () => {
			const suggestions = new Set<string>()
			addTechnicalRiskSuggestions('this is some normal code', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.technicalDebt)).toBe(false)
		})

		test('should add security suggestion when text contains relevant patterns', () => {
			const suggestions = new Set<string>()
			addTechnicalRiskSuggestions('there is a security issue with sensitive data', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.securityIssue)).toBe(true)
		})

		test('should not add security suggestion when text does not contain relevant patterns', () => {
			const suggestions = new Set<string>()
			addTechnicalRiskSuggestions('this is some normal code', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.securityIssue)).toBe(false)
		})

		test('should add architecture suggestion when text contains relevant patterns', () => {
			const suggestions = new Set<string>()
			addTechnicalRiskSuggestions('we need to improve the architecture design', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.architectureImpact)).toBe(true)
		})

		test('should not add architecture suggestion when text does not contain relevant patterns', () => {
			const suggestions = new Set<string>()
			addTechnicalRiskSuggestions('this is some normal code', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.architectureImpact)).toBe(false)
		})

		test('should add performance suggestion when text contains relevant patterns', () => {
			const suggestions = new Set<string>()
			addTechnicalRiskSuggestions('the performance is slow and needs optimization', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.performanceConcern)).toBe(true)
		})

		test('should not add performance suggestion when text does not contain relevant patterns', () => {
			const suggestions = new Set<string>()
			addTechnicalRiskSuggestions('this is some normal code', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.performanceConcern)).toBe(false)
		})

		test('should add multiple suggestions when text contains multiple patterns', () => {
			const suggestions = new Set<string>()
			addTechnicalRiskSuggestions('the performance is slow and has security issues with technical debt', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.performanceConcern)).toBe(true)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.securityIssue)).toBe(true)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.technicalDebt)).toBe(true)
		})
	})

	describe('addQualityAndKnowledgeSuggestions', () => {
		test('should add test coverage suggestion when text contains relevant patterns', () => {
			const suggestions = new Set<string>()
			addQualityAndKnowledgeSuggestions('we need better test coverage', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.testCoverage)).toBe(true)
		})

		test('should not add test coverage suggestion when text does not contain relevant patterns', () => {
			const suggestions = new Set<string>()
			addQualityAndKnowledgeSuggestions('this is some normal code', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.testCoverage)).toBe(false)
		})

		test('should add knowledge concentration suggestion when text contains relevant patterns', () => {
			const suggestions = new Set<string>()
			addQualityAndKnowledgeSuggestions('only one developer has the specialized knowledge', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.knowledgeConcentration)).toBe(true)
		})

		test('should not add knowledge concentration suggestion when text does not contain relevant patterns', () => {
			const suggestions = new Set<string>()
			addQualityAndKnowledgeSuggestions('this is some normal code', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.knowledgeConcentration)).toBe(false)
		})

		test('should add multiple suggestions when text contains multiple patterns', () => {
			const suggestions = new Set<string>()
			addQualityAndKnowledgeSuggestions(
				'we need better test coverage and there is single developer expertise',
				suggestions,
			)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.testCoverage)).toBe(true)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.knowledgeConcentration)).toBe(true)
		})
	})

	describe('addTimelineAndPlanningSuggestions', () => {
		test('should add timeline risk suggestion when text contains relevant patterns', () => {
			const suggestions = new Set<string>()
			addTimelineAndPlanningSuggestions('there may be timeline issues with the deadline', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.timelineRisk)).toBe(true)
		})

		test('should not add timeline risk suggestion when text does not contain relevant patterns', () => {
			const suggestions = new Set<string>()
			addTimelineAndPlanningSuggestions('this is some normal code', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.timelineRisk)).toBe(false)
		})

		test('should add sprint boundary suggestion when text contains relevant patterns', () => {
			const suggestions = new Set<string>()
			addTimelineAndPlanningSuggestions('this may cross sprint boundaries', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.sprintBoundary)).toBe(true)
		})

		test('should not add sprint boundary suggestion when text does not contain relevant patterns', () => {
			const suggestions = new Set<string>()
			addTimelineAndPlanningSuggestions('this is some normal code', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.sprintBoundary)).toBe(false)
		})

		test('should add multiple suggestions when text contains multiple patterns', () => {
			const suggestions = new Set<string>()
			addTimelineAndPlanningSuggestions('this may have timeline issues and cross sprint boundaries', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.timelineRisk)).toBe(true)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.sprintBoundary)).toBe(true)
		})
	})

	describe('addDependencySuggestions', () => {
		test('should add blocking dependencies suggestion when text contains relevant patterns', () => {
			const suggestions = new Set<string>()
			addDependencySuggestions('we are blocked by a dependency', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.blockingDependencies)).toBe(true)
		})

		test('should not add blocking dependencies suggestion when text does not contain relevant patterns', () => {
			const suggestions = new Set<string>()
			addDependencySuggestions('this is some normal code', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.blockingDependencies)).toBe(false)
		})

		test('should add external dependencies suggestion when text contains relevant patterns', () => {
			const suggestions = new Set<string>()
			addDependencySuggestions('coordinating with external teams', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.externalDependencies)).toBe(true)
		})

		test('should not add external dependencies suggestion when text does not contain relevant patterns', () => {
			const suggestions = new Set<string>()
			addDependencySuggestions('this is some normal code', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.externalDependencies)).toBe(false)
		})

		test('should add multiple suggestions when text contains multiple patterns', () => {
			const suggestions = new Set<string>()
			addDependencySuggestions('we are blocking on dependencies from external teams', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.blockingDependencies)).toBe(true)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.externalDependencies)).toBe(true)
		})
	})

	describe('addInformationRiskSuggestions', () => {
		test('should add requirements gap suggestion when text contains relevant patterns', () => {
			const suggestions = new Set<string>()
			addInformationRiskSuggestions('the requirements are unclear and ambiguous', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.requirementsGap)).toBe(true)
		})

		test('should not add requirements gap suggestion when text does not contain relevant patterns', () => {
			const suggestions = new Set<string>()
			addInformationRiskSuggestions('this is some normal code', suggestions)
			expect(suggestions.has(MITIGATION_SUGGESTIONS.requirementsGap)).toBe(false)
		})
	})
})
