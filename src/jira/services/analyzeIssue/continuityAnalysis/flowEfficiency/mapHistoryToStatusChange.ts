/**
 * Maps a history item to a status change object
 *
 * @param history - The history item from issue changelog
 * @returns A status change object with date, fromStatus, and toStatus
 */
export function mapHistoryToStatusChange(history: {
	created: string
	items: Array<{
		field: string
		fromString?: string | null
		toString?: string | null
	}>
}): {
	date: Date
	fromStatus: string | null
	toStatus: string | null
} {
	const statusItem = history.items.find((item) => item.field === 'status')
	return {
		date: new Date(history.created),
		fromStatus: statusItem?.fromString ?? null,
		toStatus: statusItem?.toString ?? null,
	}
}
