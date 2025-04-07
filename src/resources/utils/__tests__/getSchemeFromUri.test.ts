import { getSchemeFromUri } from '../getSchemeFromUri'

describe('getSchemeFromUri', () => {
	describe('Valid URIs', () => {
		it('should extract http scheme correctly', () => {
			expect(getSchemeFromUri('http://example.com')).toBe('http')
		})

		it('should extract https scheme correctly', () => {
			expect(getSchemeFromUri('https://example.com/path?query=value')).toBe('https')
		})

		it('should extract ftp scheme correctly', () => {
			expect(getSchemeFromUri('ftp://server.example.com')).toBe('ftp')
		})

		it('should extract custom scheme correctly', () => {
			expect(getSchemeFromUri('jira://issue/KEY-123')).toBe('jira')
		})

		it('should handle schemes with numbers and allowed special chars', () => {
			expect(getSchemeFromUri('scheme123+.-://example')).toBe('scheme123+.-')
		})

		it('should extract long scheme names correctly', () => {
			expect(getSchemeFromUri('verylongschemenamewithalotofcharacters://example')).toBe(
				'verylongschemenamewithalotofcharacters',
			)
		})
	})

	describe('Invalid inputs', () => {
		it('should return undefined for null input', () => {
			expect(getSchemeFromUri(null as unknown as string)).toBeUndefined()
		})

		it('should return undefined for undefined input', () => {
			expect(getSchemeFromUri(undefined as unknown as string)).toBeUndefined()
		})

		it('should return undefined for empty string', () => {
			expect(getSchemeFromUri('')).toBeUndefined()
		})

		it('should return undefined for non-string inputs', () => {
			expect(getSchemeFromUri(123 as unknown as string)).toBeUndefined()
			expect(getSchemeFromUri({} as unknown as string)).toBeUndefined()
			expect(getSchemeFromUri([] as unknown as string)).toBeUndefined()
		})
	})

	describe('Malformed URIs', () => {
		it('should return undefined for URI missing scheme', () => {
			expect(getSchemeFromUri('example.com')).toBeUndefined()
		})

		it('should return undefined for URI with leading whitespace', () => {
			expect(getSchemeFromUri(' http://example.com')).toBeUndefined()
		})

		it('should return undefined for URI with trailing whitespace', () => {
			expect(getSchemeFromUri('http://example.com ')).toBeUndefined()
		})

		it('should return undefined for URI with problematic pattern', () => {
			expect(getSchemeFromUri('http:/missing-slash')).toBeUndefined()
		})

		it('should return undefined for URI with invalid scheme format', () => {
			expect(getSchemeFromUri('1http://invalid-scheme.com')).toBeUndefined()
			expect(getSchemeFromUri('_http://invalid-scheme.com')).toBeUndefined()
		})
	})

	describe('Error handling', () => {
		it('should return undefined when regex matching throws an error', () => {
			// Create a string object that throws when match is called
			const badString = new String('http://example.com')
			Object.defineProperty(badString, 'match', {
				get: () => {
					throw new Error('Simulated error')
				},
			})

			expect(getSchemeFromUri(badString as unknown as string)).toBeUndefined()
		})
	})
})
