/**
 * Checks if a component name indicates frontend/UI work
 */
export function isFrontendComponent(componentName: string): boolean {
	const lowercaseName = componentName.toLowerCase()
	return lowercaseName.includes('frontend') || lowercaseName.includes('ui') || lowercaseName.includes('interface')
}
