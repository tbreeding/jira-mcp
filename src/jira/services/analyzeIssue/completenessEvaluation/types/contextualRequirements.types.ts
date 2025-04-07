/**
 * Interface defining which information categories are relevant for an issue
 */
export interface ContextualRequirements {
	needsTechnicalConstraints: boolean
	needsTestingRequirements: boolean
	needsDesignSpecifications: boolean
	needsUserImpact: boolean
}
