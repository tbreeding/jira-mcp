/**
 * Design File Detection Utility for Completeness Evaluation
 *
 * This utility function analyzes filenames to determine if they are related to design
 * assets or documentation. It checks file extensions (such as png, jpg, pdf) and
 * keywords in the filename (design, mockup, wireframe) to identify files that are likely
 * to contain design specifications. This detection is used as part of the completeness
 * evaluation process to determine if design requirements are adequately documented.
 */
export function isDesignRelatedFile(filename: string): boolean {
	const lowercaseFilename = filename.toLowerCase()
	return (
		lowercaseFilename.endsWith('.png') ||
		lowercaseFilename.endsWith('.jpg') ||
		lowercaseFilename.endsWith('.pdf') ||
		lowercaseFilename.includes('design') ||
		lowercaseFilename.includes('mockup') ||
		lowercaseFilename.includes('wireframe')
	)
}
