import { isDesignRelatedFile } from './isDesignRelatedFile'

describe('isDesignRelatedFile', () => {
	it('should return true for PNG files', () => {
		expect(isDesignRelatedFile('mockup.png')).toBe(true)
		expect(isDesignRelatedFile('SCREENSHOT.PNG')).toBe(true)
	})

	it('should return true for JPG files', () => {
		expect(isDesignRelatedFile('design.jpg')).toBe(true)
		expect(isDesignRelatedFile('UI.JPG')).toBe(true)
	})

	it('should return true for PDF files', () => {
		expect(isDesignRelatedFile('specs.pdf')).toBe(true)
		expect(isDesignRelatedFile('DOCUMENT.PDF')).toBe(true)
	})

	it('should return true for files with design-related names', () => {
		expect(isDesignRelatedFile('design_specs.txt')).toBe(true)
		expect(isDesignRelatedFile('ui_mockup.xml')).toBe(true)
		expect(isDesignRelatedFile('wireframe_v2.html')).toBe(true)
	})

	it('should return false for unrelated files', () => {
		expect(isDesignRelatedFile('document.txt')).toBe(false)
		expect(isDesignRelatedFile('code.js')).toBe(false)
		expect(isDesignRelatedFile('data.json')).toBe(false)
	})
})
