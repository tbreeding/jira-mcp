/**
 * Defines the specific request and response types for the 'resources/read' MCP handler.
 * These types are based on the standard MCP SDK types but may be aliased for clarity.
 */

import type {
	ReadResourceRequest as SdkReadResourceRequest,
	ReadResourceResult as SdkReadResourceResult,
	ListResourcesRequest as SdkListResourcesRequest,
	ListResourcesResult as SdkListResourcesResult,
} from '@modelcontextprotocol/sdk/types.js'

// Alias for clarity within the handler context
export type ReadResourceRequest = SdkReadResourceRequest
export type ReadResourceResponse = SdkReadResourceResult

// Add type aliases for list resources request/response
export type ListResourcesRequest = SdkListResourcesRequest
export type ListResourcesResponse = SdkListResourcesResult
