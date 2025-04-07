/**
 * Type definitions for Jira issue description content nodes
 */

/**
 * Represents a content node in a Jira description or comment
 */
export interface DescriptionContentNode {
	type: string
	attrs?: Record<string, unknown>
	content?: DescriptionContentNode[]
	text?: string
	marks?: {
		type: string
		attrs?: Record<string, unknown>
	}[]
}

/**
 * Structure of a Jira issue description
 */
export interface IssueDescription {
	version?: number
	type?: string
	content?: DescriptionContentNode[]
}

/**
 * Jira Issue Type Definitions
 *
 * This module defines the comprehensive TypeScript interface structure for Jira issues
 * and their related components. It provides detailed type definitions for the complex
 * data structures returned by the Jira API, including issue fields, changelogs, comments,
 * links, and custom fields. These type definitions enable type-safe processing of issue
 * data throughout the application, ensuring reliable access to and manipulation of issue
 * information for analysis and presentation.
 */
interface JiraContent {
	type: string
	version: number
	content: Array<JiraContent>
	text?: string
	attrs?: Record<string, unknown>
	marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
}

export interface IssueChangeLogResponseBody {
	self: string
	maxResults: number
	startAt: number
	total: number
	isLast?: true
	values: IssueChangeLogEntry[]
}

export interface IssueChangeLogEntry {
	id: string
	author: AssignedUser
	created: string
	items: ChangeLogItem[]
	historyMetadata?: Record<string, unknown>
}

interface ChangeLogItem {
	field: string
	fieldtype: string
	fieldId: string
	from: string | null
	fromString: string | null
	to: string | null
	toString: string | null
	tmpFromAccountId?: unknown
	tmpToAccountId?: string
}

interface AssignedUser {
	self: string // URL
	accountId: string
	emailAddress?: string
	avatarUrls: Record<string, string>
	displayName: string
	active: boolean
	timeZone: string
	accountType: string
}

interface JiraCustomField {
	self: string
	value: string
	id: string
}

export interface IssueChangeLog {
	startAt: number
	maxResults: number
	total: number
	histories: IssueChangeLogEntry[]
}

export interface JiraIssue {
	expand: string
	id: string
	self: string // URL
	key: string
	changelog: IssueChangeLog
	fields: {
		parent?: {
			id: string
			key: string
			self: string
			fields: {
				summary: string
				status: {
					self: string
					description: string
					iconUrl: string
					name: string
					id: string
					statusCategory: {
						self: string
						id: number
						key: string
						colorName: string
						name: string
					}
				}
				priority: {
					self: string
					iconUrl: string
					name: string
					id: string
				}
				issuetype: {
					self: string
					id: string
					description: string
					iconUrl: string
					name: string
					subtask: boolean
					avatarId: number
					hierarchyLevel: number
				}
			}
		}
		customfield_14670?: unknown
		customfield_14791?: unknown
		customfield_14671?: unknown
		customfield_14792?: unknown
		customfield_14790?: unknown
		customfield_14674?: unknown
		customfield_16249?: JiraCustomField[]
		customfield_15127?: JiraCustomField[]
		customfield_16233?: JiraCustomField
		customfield_13100: {
			hasEpicLinkFieldDependency: boolean
			showField: boolean
			nonEditableReason: {
				reason: string
				message: string
			}
		}
		customfield_14795?: unknown
		customfield_14796?: unknown
		customfield_14675?: unknown
		customfield_14672?: unknown
		customfield_14793?: unknown
		customfield_14673?: unknown
		customfield_14799?: unknown
		resolution?: {
			self: string
			id: string
			description: string
			name: string
		}
		customfield_14679?: unknown
		customfield_14797?: unknown
		customfield_14676?: unknown
		customfield_14677?: unknown
		customfield_14798?: unknown
		customfield_14548?: unknown
		customfield_14306?: unknown
		customfield_14669?: unknown
		customfield_15010?: unknown
		customfield_15015?: unknown
		customfield_15016?: unknown
		customfield_15013?: unknown
		customfield_15014?: unknown
		customfield_14946?: unknown
		customfield_14939?: unknown
		customfield_14937?: unknown
		customfield_14938?: unknown
		customfield_16279?: number | null
		customfield_14945?: number | null
		customfield_14942?: unknown
		customfield_14943?: unknown
		customfield_14940?: unknown
		customfield_14941?: unknown
		customfield_14935?: unknown
		customfield_14936?: unknown
		customfield_14933?: unknown
		customfield_14934?: unknown
		customfield_14932?: unknown
		customfield_14930?: unknown
		customfield_14924?: unknown
		customfield_14925?: unknown
		customfield_14928?: unknown
		customfield_14929?: unknown
		customfield_14926?: unknown
		customfield_14927?: unknown
		customfield_14902?: unknown
		customfield_14900?: unknown
		customfield_14901?: JiraCustomField
		customfield_14931?: {
			content: {
				content: JiraContent[]
				type: string
			}[]
			type: string
			version: number
		}
		customfield_15012?: JiraCustomField[]
		customfield_12801: JiraCustomField
		lastViewed?: unknown
		customfield_14780?: unknown
		customfield_14660?: unknown
		customfield_14781?: unknown
		customfield_14663?: unknown
		customfield_14784?: unknown
		customfield_14882?: unknown
		customfield_14300?: unknown
		customfield_12000?: unknown
		customfield_14542?: unknown
		customfield_14664?: unknown
		customfield_14543?: unknown
		customfield_14301?: unknown
		customfield_14540?: unknown
		customfield_12002?: unknown
		customfield_14661?: unknown
		customfield_14782?: unknown
		customfield_12001?: unknown[]
		customfield_14662?: unknown
		customfield_14541?: unknown
		customfield_14783?: unknown
		customfield_14304?: unknown
		customfield_12004?: unknown
		customfield_14990?: unknown
		customfield_14993?: unknown
		customfield_14788: JiraCustomField
		customfield_14667?: unknown
		customfield_14546?: unknown
		customfield_12003?: unknown
		customfield_14547?: unknown
		customfield_14305?: unknown
		customfield_14668?: unknown
		customfield_14786?: unknown
		customfield_14665?: unknown
		customfield_14544?: unknown
		customfield_14302?: unknown
		customfield_12005?: unknown
		customfield_14666?: unknown
		customfield_14303?: unknown
		labels: string[]
		customfield_14545?: unknown
		customfield_14539?: unknown
		customfield_11700: JiraCustomField[]
		customfield_14658?: unknown
		customfield_14538?: unknown
		customfield_14659?: unknown
		aggregatetimeoriginalestimate?: unknown
		issuelinks?: IssueLink[]
		assignee: AssignedUser | null
		components?: unknown[]
		customfield_14770?: JiraCustomField | null
		customfield_14652?: unknown
		customfield_14653?: unknown
		customfield_14650?: unknown
		customfield_13201?: unknown
		customfield_13200: string
		customfield_14651?: unknown
		customfield_14772?: unknown
		customfield_14656?: unknown
		customfield_10106?: unknown
		customfield_14535: JiraCustomField
		customfield_14536?: unknown
		customfield_14994?: unknown
		customfield_14991?: unknown
		customfield_14992?: unknown
		customfield_14997?: unknown
		customfield_14657?: unknown
		customfield_14654?: unknown
		customfield_14655?: unknown
		customfield_14534?: unknown
		customfield_14649?: unknown
		customfield_14528?: unknown
		customfield_10600: IssueSprintAssignment[] | null
		customfield_14526?: unknown
		customfield_14647?: unknown
		customfield_14648?: unknown
		customfield_14527?: unknown
		customfield_14880?: unknown
		subtasks?: unknown[]
		customfield_14641?: unknown
		customfield_14763?: unknown
		customfield_14642?: unknown
		customfield_14400?: unknown
		customfield_14760?: unknown
		reporter: AssignedUser
		customfield_12101?: unknown
		customfield_14640?: unknown
		customfield_14766?: unknown
		customfield_14524?: unknown
		customfield_14645?: unknown
		customfield_14646?: unknown
		customfield_14525?: unknown
		customfield_14764?: unknown
		customfield_14643?: unknown
		customfield_14644?: unknown
		customfield_14765?: unknown
		customfield_14638?: unknown
		customfield_14759?: unknown
		customfield_14517?: unknown
		customfield_14639?: unknown
		customfield_14515: JiraCustomField
		customfield_14878?: unknown
		customfield_14516?: unknown
		customfield_11800?: unknown
		customfield_14637?: unknown
		customfield_14879?: unknown
		customfield_14996?: unknown
		customfield_14988?: unknown
		customfield_14989?: unknown
		customfield_14995: JiraCustomField
		progress: {
			progress: number
			total: number
		}
		votes: {
			self: string
			votes: number
			hasVoted: boolean
		}
		issuetype: {
			self: string
			id: string
			description: string
			iconUrl: string
			name: string
			subtask: boolean
			avatarId: number
			hierarchyLevel: number
		}
		customfield_14872?: unknown
		customfield_14751: JiraCustomField | null
		project: {
			self: string
			id: string
			key: string
			name: string
			projectTypeKey: string
			simplified: boolean
			avatarUrls: Record<string, string>
			projectCategory: {
				self: string
				id: string
				description: string
				name: string
			}
		}
		customfield_14977: JiraCustomField[]
		customfield_14978?: unknown
		customfield_14971?: unknown
		customfield_14972?: unknown
		customfield_14970?: unknown
		customfield_14975?: unknown
		customfield_14976?: unknown
		customfield_14973?: unknown
		customfield_14974?: unknown
		customfield_14968?: unknown
		customfield_14969?: unknown
		customfield_14966?: unknown
		customfield_14967?: unknown
		customfield_14964?: unknown
		customfield_14965?: unknown
		customfield_14982?: unknown
		customfield_14980?: unknown
		customfield_14865?: unknown
		customfield_14987?: unknown
		customfield_14984?: unknown
		customfield_14979?: unknown
		customfield_14510?: unknown
		customfield_14873?: unknown
		customfield_13300?: unknown
		customfield_14870?: unknown
		customfield_14750?: unknown
		customfield_14957?: unknown
		customfield_14958?: unknown
		customfield_14955?: unknown
		customfield_14959?: unknown
		customfield_14634?: unknown
		customfield_15001?: unknown
		customfield_15004?: unknown
		customfield_15006: JiraCustomField
		customfield_15007?: unknown
		customfield_15005?: unknown
		customfield_15002?: unknown
		customfield_15008?: unknown
		customfield_15003?: unknown
		customfield_14755?: unknown[]
		customfield_14876?: unknown
		customfield_14513?: unknown
		customfield_14514?: unknown
		customfield_14877?: unknown
		customfield_14635?: unknown
		customfield_14511?: unknown
		customfield_14632?: unknown
		customfield_14874?: unknown
		customfield_14753?: unknown
		customfield_14512?: unknown
		customfield_14633?: unknown
		customfield_14506?: unknown
		customfield_14869?: unknown
		customfield_14867?: unknown
		customfield_14746?: unknown
		customfield_14868?: unknown
		customfield_14505?: unknown
		resolutiondate?: string | null
		customfield_14508?: unknown
		customfield_14509: JiraCustomField
		watches: {
			self: string
			watchCount: number
			isWatching: boolean
		}
		customfield_14740?: unknown
		customfield_14741?: JiraCustomField[]
		customfield_12200?: unknown
		customfield_14860?: unknown
		customfield_14503?: unknown
		customfield_14745?: unknown
		customfield_14500?: unknown
		customfield_14501?: unknown
		customfield_14737: string
		customfield_14858?: unknown
		customfield_14738?: unknown
		customfield_14859?: unknown
		customfield_14856: JiraCustomField
		customfield_14735: number
		customfield_11900?: unknown
		customfield_14857?: unknown
		customfield_14736?: unknown
		customfield_14739?: unknown
		updated: string
		timeoriginalestimate?: unknown
		description: IssueDescription | string | null
		customfield_14730?: unknown
		customfield_11100: string | null
		customfield_14733: number
		customfield_14854?: unknown
		customfield_14855?: unknown
		customfield_14734: number
		customfield_14731?: unknown
		customfield_14732?: unknown
		customfield_14726?: unknown
		customfield_12305?: unknown
		customfield_12304?: unknown
		customfield_12306?: unknown
		customfield_10807?: unknown
		summary: string
		customfield_14840?: unknown
		customfield_12301?: unknown
		customfield_14843?: unknown
		customfield_12300?: unknown
		customfield_14723?: unknown
		customfield_14720?: unknown
		customfield_12303: JiraCustomField[]
		customfield_14841?: unknown
		customfield_14721?: unknown
		customfield_14842?: unknown
		customfield_14715?: unknown
		customfield_14836?: unknown
		customfield_14716: JiraCustomField
		environment?: unknown
		customfield_14835?: unknown
		customfield_14714?: unknown
		customfield_14719?: unknown
		customfield_14717?: unknown
		duedate?: unknown
		customfield_14838?: unknown
		customfield_14839?: unknown
		customfield_14718: {
			version: number
			type: string
			content: {
				type: string
				content: {
					type: string
					text?: string
				}[]
			}[]
		}
		statuscategorychangedate: string
		fixVersions?: FixVersion[]
		customfield_11200: AssignedUser[]
		customfield_13500: {
			id: string
			title: string
			isShared: boolean
			name: string
		}
		customfield_14832?: unknown
		customfield_14831?: unknown
		customfield_14825?: unknown
		customfield_10105?: number | null // Story Points
		customfield_14702?: unknown
		customfield_14703: JiraCustomField
		customfield_10900?: unknown
		customfield_10109?: unknown
		customfield_10901?: unknown
		customfield_12400?: unknown
		customfield_14821?: unknown
		customfield_14700?: unknown
		priority: {
			self: string
			iconUrl: string
			name: string
			id: string
		}
		customfield_10100?: unknown
		customfield_10101?: unknown
		customfield_14701?: unknown
		customfield_14822?: unknown
		customfield_10102?: unknown
		customfield_10103?: unknown
		customfield_14820?: unknown
		customfield_14814?: unknown
		customfield_14815?: unknown
		customfield_14812?: unknown
		customfield_14813?: unknown
		customfield_14818: JiraCustomField
		timeestimate?: unknown
		versions?: unknown[]
		customfield_14819?: unknown
		customfield_14816?: unknown
		customfield_14817?: unknown
		status: {
			self: string
			description: string
			iconUrl: string
			name: string
			id: string
			statusCategory: {
				self: string
				id: number
				key: string
				colorName: string
				name: string
			}
		}
		customfield_14810?: unknown
		customfield_14811?: unknown
		customfield_11300: string
		customfield_13600?: unknown
		customfield_14803?: unknown
		customfield_12503?: unknown
		customfield_14804?: unknown
		customfield_12502?: unknown
		customfield_12505?: unknown
		customfield_14801?: unknown
		customfield_12504?: unknown
		customfield_14802?: unknown
		aggregatetimeestimate?: unknown
		customfield_12507?: unknown
		customfield_14807?: unknown
		customfield_14808?: unknown
		customfield_12506?: unknown
		customfield_14805?: unknown
		customfield_14806?: unknown
		customfield_14809?: unknown
		creator: AssignedUser
		customfield_14000?: unknown
		aggregateprogress: {
			progress: number
			total: number
		}
		customfield_10200?: unknown
		timespent?: unknown
		aggregatetimespent?: unknown
		customfield_13700?: unknown
		customfield_11401?: unknown
		workratio: -1
		created: string
		customfield_14100?: unknown
		customfield_10300?: unknown
		customfield_13810?: unknown
		customfield_13801?: unknown
		customfield_13800: JiraCustomField
		customfield_13802?: unknown
		customfield_13805?: unknown
		customfield_13808?: unknown
		customfield_14692?: unknown
		customfield_14693?: unknown
		customfield_14690?: unknown
		customfield_14691?: unknown
		customfield_14696?: unknown
		customfield_13000?: unknown
		customfield_14697?: unknown
		customfield_14694?: unknown
		customfield_14695?: unknown
		customfield_14698?: unknown
		customfield_14699?: unknown
		customfield_13910?: unknown
		security?: unknown
		customfield_14680: string
		customfield_14685?: unknown
		customfield_14686?: unknown
		customfield_14683?: unknown
		customfield_14684?: unknown
		customfield_14200?: unknown
		customfield_14689?: unknown
		customfield_14568?: unknown
		customfield_14687?: unknown
		customfield_10400?: unknown
		customfield_14567?: unknown
		customfield_14688?: unknown
		customfield_13900?: unknown
		customfield_11600?: unknown
		customfield_13901?: unknown
		customfield_13905?: unknown
		customfield_13908?: unknown
		customfield_13907?: unknown
		customfield_13909?: unknown
		[key: string]: unknown
	}
}

export interface IssueLink {
	id: string
	inwardIssue?: {
		fields: {
			issuetype: {
				avatarId: number
				description: string
				hierarchyLevel: number
				iconUrl: string
				id: string
				name: string
				self: string
				subtask: boolean
				entityId?: string
			}
			status: {
				description: string
				iconUrl: string
				id: string
				name: string
				self: string
				statusCategory: {
					colorName: string
					id: number
					key: string
					name: string
					self: string
				}
			}
			summary: string
			priority?: {
				iconUrl: string
				id: string
				name: string
				self: string
			}
		}
		id: string
		key: string
		self: string
	}
	self: string
	type: {
		id: string
		inward: string
		name: string
		outward: string
		self: string
	}
	outwardIssue?: {
		fields: {
			issuetype: {
				avatarId: number
				description: string
				hierarchyLevel: number
				iconUrl: string
				id: string
				name: string
				self: string
				subtask: boolean
			}
			priority: {
				iconUrl: string
				id: string
				name: string
				self: string
			}
			status: {
				description: string
				iconUrl: string
				id: string
				name: string
				self: string
				statusCategory: {
					colorName: string
					id: number
					key: string
					name: string
					self: string
				}
			}
			summary: string
		}
		id: string
		key: string
		self: string
	}
}

interface IssueSprintAssignment {
	boardId: number
	completeDate: string
	endDate: string
	goal: string
	id: number
	name: string
	startDate: string
	state: string
}

interface FixVersion {
	archived: boolean
	id: string
	name: string
	projectId: number
	releaseDate: string
	released: boolean
	self: string
	startDate?: string
	userReleaseDate: string
	userStartDate?: string
}
