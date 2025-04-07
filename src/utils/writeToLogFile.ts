/**
 * Writes a message to a log file
 * @param envLogFilePath - The path to the log file
 * @param fullMessage - The message to write to the log file
 */
import { appendFileSync } from 'fs'

export function writeToLogFile(envLogFilePath: string, fullMessage: string): void {
	try {
		appendFileSync(envLogFilePath, fullMessage)
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : String(err)
		process.stderr.write(`Failed to write to log file: ${errorMessage}\n`)
	}
}
