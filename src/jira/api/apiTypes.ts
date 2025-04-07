/**
 * Configuration interface for Jira API interactions
 *
 * This file defines the core configuration types needed for establishing
 * and maintaining connections to the Jira API endpoints. It provides the
 * structure for authentication and base URL configuration.
 */
export interface JiraApiConfig {
	baseUrl: string
	username: string
	apiToken: string
}
