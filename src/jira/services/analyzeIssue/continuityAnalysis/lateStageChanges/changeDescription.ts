/**
 * Creates a human-readable description of a field change
 *
 * @param item - The changelog item
 * @returns A description of the change
 */
export function getChangeDescription(item: {
	field: string
	fromString: string | null
	toString: string | null
}): string {
	const from = item.fromString || 'none'
	const to = item.toString || 'none'

	return `Changed ${item.field} from "${from}" to "${to}"`
}
