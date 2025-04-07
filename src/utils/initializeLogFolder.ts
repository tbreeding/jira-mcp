/**
 * Initializes the log folder
 *
 * @param envLogFilePath
 */
import { existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'

export function initializeLogFolder(envLogFilePath: string): void {
	try {
		const dir = dirname(envLogFilePath)
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true })
		}
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : String(err)
		process.stderr.write(`Failed to initialize log directory: ${errorMessage}\n`)
	}
}
