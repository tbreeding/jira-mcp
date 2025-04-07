/**
 * Requirements Initialization Module for Completeness Evaluation
 *
 * This utility provides functionality to initialize the requirements configuration
 * for Jira issue completeness evaluation. It ensures that a valid requirements
 * configuration is always available by supplying default values when no specific
 * requirements are provided. The default configuration enables most standard
 * requirement categories while making design specifications optional by default.
 */
import type { ContextualRequirements } from '../types/contextualRequirements.types'

/**
 * Initialize requirements with defaults if not provided
 */
export function initializeRequirements(contextualRequirements?: ContextualRequirements): ContextualRequirements {
	return (
		contextualRequirements || {
			needsTechnicalConstraints: true,
			needsTestingRequirements: true,
			needsDesignSpecifications: false,
			needsUserImpact: true,
		}
	)
}
