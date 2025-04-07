# Refactoring Tools with MCP Prompts and Resources

This document outlines a plan to refactor the existing tools implementation (`src/tools`) by leveraging the Model Context Protocol (MCP) concepts of `Prompts` and `Resources`. The goal is to simplify the codebase, improve maintainability, and align more closely with MCP best practices.

## Core MCP Concepts

*   **Resources:** Application-controlled mechanisms for exposing data (e.g., files, database records, API results like Jira issues) identified by URIs (`file:///...`, `jira://...`). Clients read these resources to provide context to LLMs.
*   **Prompts:** User-controlled, server-defined templates or workflows (e.g., slash commands) that structure LLM interactions. They can accept arguments (including resource URIs) and define simple or multi-step interactions.

## Analysis of Existing Tools (`src/tools`)

*   **`jira/` Directory:**
    *   `getIssue.ts`, `executeGetIssuesByJqlTool.ts`: Primarily fetch Jira data. This aligns directly with the `Resource` concept.
    *   `analyzeIssue.ts`, `executeAnalyzeIssueTool.ts`: Perform actions based on Jira data. This fits the `Prompt` pattern for defining interaction workflows.
    *   Helper files (`responseFormatter.ts`, etc.): Support the core logic and would be adapted.

### Rationale: Resources vs. Prompts/Tools for Jira Data Fetching

The core distinction lies in purpose: MCP `Resources` expose read-only **data** (nouns, identified by URIs), while MCP `Prompts` define **actions** or **workflows** (verbs, potentially using resource data).

*   `getIssue` and `executeGetIssuesByJqlTool` fundamentally perform **read operations**. They retrieve specific information (an issue by ID, issues by JQL) from Jira without performing complex transformations or workflows. Their function is to make Jira data *available*. This maps directly to the MCP `Resource` pattern, where a client reads data from a specific URI (e.g., `jira://.../issue/ID` or `jira://.../search?jql=...`).
*   In contrast, `analyzeIssue` performs an **action** (analysis) *using* the data. It fits the `Prompt` pattern, defining an interaction that likely takes a resource URI (pointing to the issue data) as input.

Refactoring the data-fetching tools into a Resource provider centralizes data access logic and separates it cleanly from the action-oriented logic handled by Prompts.

*   **`issueCreationWizard/` Directory:**
    *   Implements a complex, stateful, multi-step process.
    *   MCP Prompts explicitly support dynamic, multi-step workflows, making this a prime candidate for refactoring into a `Prompt`. Data needed during the wizard (projects, users) could be supplied via `Resources`.

### Rationale: Issue Creation Wizard as a Prompt

The wizard is fundamentally a **process** involving multiple steps, user interaction, state management, and culminating in an **action** (creating an issue). This aligns directly with MCP `Prompts`, which handle workflows and stateful interactions, rather than `Resources` which expose read-only data.

While the overall wizard is a Prompt (e.g., `create-jira-issue`), the data required *during* the process (lists of projects, issue types for a selected project, fields for a selected issue type) are ideal candidates for `Resources`. The Prompt handler would read these Resources at the appropriate steps.

### Proposed Wizard Prompt Flow:

1.  **Initiation:** Client invokes the `create-jira-issue` Prompt.
2.  **Project Selection:** Prompt handler reads `jira://.../projects` Resource, presents list to user via client, awaits selection.
3.  **Issue Type Selection:** Prompt handler receives project, reads `jira://.../project/KEY/issuetypes` Resource, presents list, awaits selection.
4.  **Field Completion:** Prompt handler receives type, reads `jira://.../project/KEY/issuetype/ID/fields` Resource, interacts with user via client to collect field values (potentially over multiple turns), performs validation.
5.  **Review (Optional):** Prompt handler presents collected data for confirmation.
6.  **Submission:** Prompt handler uses collected state to call Jira API, creates issue.
7.  **Completion:** Prompt finishes, returning the URI of the new issue Resource (`jira://.../issue/NEW-ID`) or an error.

This separates the workflow logic (Prompt) from data fetching (Resources), leveraging standard MCP mechanisms.

## Proposed Refactoring Strategy

1.  **Introduce Jira Resources:**
    *   Implement a resource provider for Jira issues (`jira://<instance>/issue/ID`, `jira://<instance>/search?jql=...`).
    *   The provider should include relevant metadata with the resource content, such as `display name` (e.g., issue summary), `description`, and a suitable `MIME type` (e.g., `application/json` or a custom Jira type).
    *   The JQL search resource (`jira://<instance>/search?jql=...`) will be dynamically generated based on the query parameters in the requested URI.
    *   Define clear error handling mechanisms for the resource provider (e.g., what happens if an issue ID is not found, JQL is invalid, or the Jira API fails).
    *   Deprecate data-fetching tools (`getIssue`, `executeGetIssuesByJqlTool`). Clients will use `resources/read`.
2.  **Introduce Jira Prompts:**
    *   Implement prompt handlers (e.g., `analyze-jira-issue`) that take resource URIs as arguments.
    *   Deprecate action-oriented tools (`analyzeIssue`, `executeAnalyzeIssueTool`). Clients will use `prompts/get`.
3.  **Refactor Issue Creation Wizard:**
    *   Redesign the wizard as a dynamic, multi-step `Prompt` (e.g., `create-jira-issue`), following the flow outlined above.
    *   Leverage `Resources` for dynamic data needed during the workflow (e.g., project lists, issue types, fields via URIs like `jira://.../projects`).
    *   Deprecate the existing `issueCreationWizard/` tool implementation.
4.  **Cleanup:**
    *   Refactor or remove helper functions as needed.
    *   Simplify the tool registration/orchestration logic (e.g., in `tools/index.ts`).

## Benefits

*   **Reduced Complexity:** Replaces custom tool logic with standard MCP patterns. Simplifies state management, especially for the wizard.
*   **Improved Readability:** Clearer separation between data exposure (`Resources`) and interaction logic (`Prompts`).
*   **Enhanced Maintainability:** Changes are localized (e.g., data fetching logic in the resource provider, analysis logic in the prompt handler).
*   **MCP Alignment:** Creates a more idiomatic and standardized MCP server implementation. 