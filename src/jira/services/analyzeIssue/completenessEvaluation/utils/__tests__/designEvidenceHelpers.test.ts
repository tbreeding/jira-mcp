import {
	hasDesignMentions,
	checkDesignLinks,
	hasMultipleDesignEvidenceTypes,
	determineDesignQuality,
} from '../designEvidenceHelpers'

describe('designEvidenceHelpers', () => {
	describe('hasDesignMentions', () => {
		it('should return true when text contains design specification mentions', () => {
			const text = 'We need a detailed design specification for this feature'
			expect(hasDesignMentions(text)).toBe(true)
		})

		it('should return true when text contains mockup mentions', () => {
			const text = 'Please refer to the mockup attached'
			expect(hasDesignMentions(text)).toBe(true)
		})

		it('should return true when text contains wireframe mentions', () => {
			const text = 'The wireframe shows the layout structure'
			expect(hasDesignMentions(text)).toBe(true)
		})

		it('should return true when text contains UI specification mentions', () => {
			const text = 'Follow the UI specification document for building this component'
			expect(hasDesignMentions(text)).toBe(true)
		})

		it('should return true when text contains UX specification mentions', () => {
			const text = 'The UX specification defines interaction patterns'
			expect(hasDesignMentions(text)).toBe(true)
		})

		it('should return true when text contains design system mentions', () => {
			const text = 'Ensure compliance with our design system'
			expect(hasDesignMentions(text)).toBe(true)
		})

		it('should return true when text contains prototype mentions', () => {
			const text = 'I created a prototype to demonstrate the flow'
			expect(hasDesignMentions(text)).toBe(true)
		})

		it('should return true when text contains Figma mentions', () => {
			const text = 'Please check the Figma file for details'
			expect(hasDesignMentions(text)).toBe(true)
		})

		it('should return true when text contains Sketch mentions', () => {
			const text = 'The design was created in Sketch'
			expect(hasDesignMentions(text)).toBe(true)
		})

		it('should return false when no design-related terms are present', () => {
			const text = 'This is a general description without design mentions'
			expect(hasDesignMentions(text)).toBe(false)
		})
	})

	describe('checkDesignLinks', () => {
		it('should return true when text contains Figma links', () => {
			const text = 'Check out the design at https://figma.com/file/abcdef'
			expect(checkDesignLinks(text)).toBe(true)
		})

		it('should return true when text contains Sketch Cloud links', () => {
			const text = 'See the mockup at https://sketch.cloud/s/123456'
			expect(checkDesignLinks(text)).toBe(true)
		})

		it('should return true when text contains Zeplin links', () => {
			const text = 'The specs are at https://zeplin.io/project/123'
			expect(checkDesignLinks(text)).toBe(true)
		})

		it('should return true when text contains InVision links', () => {
			const text = 'Review the prototype at https://invision.design/share/ABC123'
			expect(checkDesignLinks(text)).toBe(true)
		})

		it('should return true when text contains Abstract links', () => {
			const text = 'See the file at https://abstract.com/projects/123'
			expect(checkDesignLinks(text)).toBe(true)
		})

		it('should return false when no design tool links are present', () => {
			const text = 'This is a description with https://example.com but no design tool links'
			expect(checkDesignLinks(text)).toBe(false)
		})
	})

	describe('hasMultipleDesignEvidenceTypes', () => {
		it('should return true when mentions and attachments are present', () => {
			expect(hasMultipleDesignEvidenceTypes(true, true, false)).toBe(true)
		})

		it('should return true when mentions and links are present', () => {
			expect(hasMultipleDesignEvidenceTypes(true, false, true)).toBe(true)
		})

		it('should return true when attachments and links are present', () => {
			expect(hasMultipleDesignEvidenceTypes(false, true, true)).toBe(true)
		})

		it('should return true when all evidence types are present', () => {
			expect(hasMultipleDesignEvidenceTypes(true, true, true)).toBe(true)
		})

		it('should return false when only one evidence type is present', () => {
			expect(hasMultipleDesignEvidenceTypes(true, false, false)).toBe(false)
			expect(hasMultipleDesignEvidenceTypes(false, true, false)).toBe(false)
			expect(hasMultipleDesignEvidenceTypes(false, false, true)).toBe(false)
		})

		it('should return false when no evidence types are present', () => {
			expect(hasMultipleDesignEvidenceTypes(false, false, false)).toBe(false)
		})
	})

	describe('determineDesignQuality', () => {
		it('should return "absent" when no evidence types are present', () => {
			expect(determineDesignQuality(false, false, false)).toBe('absent')
		})

		it('should return "complete" when multiple evidence types are present', () => {
			expect(determineDesignQuality(true, true, false)).toBe('complete')
			expect(determineDesignQuality(true, false, true)).toBe('complete')
			expect(determineDesignQuality(false, true, true)).toBe('complete')
			expect(determineDesignQuality(true, true, true)).toBe('complete')
		})

		it('should return "partial" when only one evidence type is present', () => {
			expect(determineDesignQuality(true, false, false)).toBe('partial')
			expect(determineDesignQuality(false, true, false)).toBe('partial')
			expect(determineDesignQuality(false, false, true)).toBe('partial')
		})
	})
})
