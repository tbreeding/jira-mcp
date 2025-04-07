import { checkDesignSpecifications } from '../checkDesignSpecifications'
import type { JiraIssue } from '../../../../types/issue.types'

describe('checkDesignSpecifications', () => {
	it('should identify absence of design specifications', () => {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const result = checkDesignSpecifications('Some text without any design information', mockIssue)

		expect(result.present).toBe(false)
		expect(result.quality).toBe('absent')
		expect(result.missing).toContain('Design specifications may be required if this involves UI changes')
	})

	it('should identify absence of design specifications for frontend issue', () => {
		const mockIssue = {
			fields: {
				components: [{ name: 'Frontend' }],
			},
		} as unknown as JiraIssue

		const result = checkDesignSpecifications('Some text without any design details', mockIssue)

		expect(result.present).toBe(false)
		expect(result.quality).toBe('absent')
		expect(result.missing).toContain('Design specifications not provided')
	})

	it('should identify presence of design specifications from text patterns', () => {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const result = checkDesignSpecifications('The design specifications can be found in Figma', mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
		expect(result.missing).toEqual([])
	})

	it('should identify presence of design specifications from attachments', () => {
		const mockIssue = {
			fields: {
				attachment: [{ filename: 'mockup.jpg' }],
			},
		} as unknown as JiraIssue

		const result = checkDesignSpecifications('Some text without mentions', mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('partial')
		expect(result.missing).toEqual([])
	})

	it('should identify presence of design specifications from links', () => {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const result = checkDesignSpecifications('Check out the design at https://figma.com/file/123', mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('complete')
		expect(result.missing).toEqual([])
	})

	it('should identify complete quality when design is mentioned and has attachments', () => {
		const mockIssue = {
			fields: {
				attachment: [{ filename: 'design.png' }],
			},
		} as unknown as JiraIssue

		const result = checkDesignSpecifications('The wireframe is attached to this issue', mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('complete')
		expect(result.missing).toEqual([])
	})

	it('should identify complete quality when design is mentioned and has links', () => {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const text = `
      The mockup can be found at https://figma.com/file/123
      Please review the design specification before implementing
    `

		const result = checkDesignSpecifications(text, mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('complete')
		expect(result.missing).toEqual([])
	})

	it('should identify complete quality when has both attachments and links', () => {
		const mockIssue = {
			fields: {
				attachment: [{ filename: 'wireframe.pdf' }],
			},
		} as unknown as JiraIssue

		const result = checkDesignSpecifications('For more details see https://sketch.cloud/s/123', mockIssue)

		expect(result.present).toBe(true)
		expect(result.quality).toBe('complete')
		expect(result.missing).toEqual([])
	})

	it('should recognize UI component as frontend issue', () => {
		const mockIssue = {
			fields: {
				components: [{ name: 'UI Components' }],
			},
		} as unknown as JiraIssue

		const result = checkDesignSpecifications('Some text', mockIssue)

		expect(result.present).toBe(false)
		expect(result.missing).toContain('Design specifications not provided')
	})

	it('should recognize Interface component as frontend issue', () => {
		const mockIssue = {
			fields: {
				components: [{ name: 'User Interface' }],
			},
		} as unknown as JiraIssue

		const result = checkDesignSpecifications('Some text', mockIssue)

		expect(result.present).toBe(false)
		expect(result.missing).toContain('Design specifications not provided')
	})

	it('should handle null components gracefully', () => {
		const mockIssue = {
			fields: {
				components: null,
			},
		} as unknown as JiraIssue

		const result = checkDesignSpecifications('Some text', mockIssue)

		expect(result.present).toBe(false)
		expect(result.missing).toContain('Design specifications may be required if this involves UI changes')
	})

	it('should check various image attachment extensions', () => {
		const extensions = ['.png', '.jpg', '.pdf']

		extensions.forEach((ext) => {
			const mockIssue = {
				fields: {
					attachment: [{ filename: `design${ext}` }],
				},
			} as unknown as JiraIssue

			const result = checkDesignSpecifications('Some text', mockIssue)
			expect(result.present).toBe(true)
		})
	})
})
