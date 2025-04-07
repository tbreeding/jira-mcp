/**
 * Helper functions for enhancing technical risk descriptions in Jira issues
 *
 * This file contains functions for enhancing risk items with more descriptive text
 */

/**
 * Enhances raw risk items with more descriptive text
 *
 * @param riskItems - Raw risk indicators detected in text
 * @returns Enhanced risk descriptions with context
 */
export function enhanceRiskItems(riskItems: string[]): string[] {
	return riskItems.map(function (item: string) {
		if (item.includes('Technical Debt')) {
			return `High technical debt risk: ${item.split(':')[1]}`
		}
		if (item.includes('Architecture')) {
			return `Architecture impact risk: ${item.split(':')[1]}`
		}
		if (item.includes('Performance')) {
			return `Performance concern: ${item.split(':')[1]}`
		}
		if (item.includes('Security')) {
			return `Security risk: ${item.split(':')[1]}`
		}
		return item
	})
}
