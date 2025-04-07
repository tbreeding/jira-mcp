/**
 * Mitigation suggestions for different risk types
 *
 * This file contains a mapping of risk types to suggested mitigation actions.
 * These are used to generate appropriate mitigation strategies based on
 * identified risks in the issue analysis.
 */

/**
 * Risk mitigation suggestions mapped by risk types
 */
export const MITIGATION_SUGGESTIONS = {
	// Technical risk mitigations
	technicalDebt:
		'Incorporate refactoring into development work rather than scheduling it separately; ensure estimates include time for proper craftsmanship',
	securityIssue: 'Request security review from security team during implementation',
	performanceConcern: 'Add specific performance acceptance criteria with measurable thresholds',
	architectureImpact: 'Schedule architecture review meeting before implementation',

	// Test coverage mitigations
	testCoverage: 'Develop comprehensive test plan before implementation begins',
	testingChallenges: 'Allocate additional time for test development and execution',

	// Knowledge concentration mitigations
	knowledgeConcentration: 'Schedule knowledge sharing sessions; document specialized components',
	specializedSkills: 'Identify team members with required specialized skills early in the process',

	// Dependency mitigations
	externalDependencies: 'Establish clear communication channels with dependent teams',
	crossTeamCoordination: 'Set up regular coordination meetings with teams owning dependencies',
	blockingDependencies: 'Consider reordering implementation to mitigate blocking dependencies',

	// Timeline mitigations
	timelineRisk: 'Consider breaking issue into smaller, more manageable sub-tasks',
	sprintBoundary: 'Plan for possibility of work extending beyond sprint boundaries',
	estimationRisk: 'Review and possibly adjust story point estimation before committing',

	// Information risk mitigations
	requirementsGap: 'Request clarification on missing requirements before implementation begins',
	ambiguityRisk: 'Document assumptions and seek confirmation from stakeholders',
}
