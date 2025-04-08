# Jira MCP Toolset (Placeholder Title - Replace with actual package name)

A collection of tools designed for interacting with Jira via the Model Context Protocol (MCP), providing core Jira functionalities and a guided Issue Creation Wizard.

## Installation

To install this package, use npm:

```bash
npm install jira-mcp # Replace with your actual package name
```

## Usage
...
## Configuration

### Environment Variables

This application requires the following environment variables to be set for Jira integration:

- `JIRA_BASE_URL`: Your Jira instance URL (e.g., `https://your-domain.atlassian.net`)
- `JIRA_USERNAME`: Your Jira username or email associated with the API token.
- `JIRA_API_TOKEN`: Your generated Jira API token.

These variables provide the necessary credentials and endpoint for the tools to communicate with your Jira instance.

## Available Tools

This application exposes the following tools via the Model Context Protocol:

### Core Jira Tools

- `getJiraIssue`: Fetches a Jira issue by its key.
- `analyzeJiraIssue`: Performs comprehensive analysis of a Jira issue.
- `jiraGet`: Fetches data from any Jira API GET endpoint.
- `getIssuesByJql`: Searches for Jira issues using a JQL query.

### Issue Creation Wizard Tools

These tools provide a step-by-step, guided process for creating new Jira issues. The wizard maintains state throughout the creation flow, typically involving these stages: initiating the process, selecting a project (`getProjects`), choosing an issue type (`getIssueTypes`), retrieving and populating the necessary fields (`getFields`, `updateFields`), optionally analyzing the issue details, and finally confirming and creating the issue (`createIssue`). Use `getState` and `getStatus` to monitor progress, and `resetState` to start over.

- `mcp_IssueCreationWizard_getState`: Gets the current internal state of the wizard.
- `mcp_IssueCreationWizard_getStatus`: Gets the high-level status of the wizard.
- `mcp_IssueCreationWizard_initiateState`: Initializes a new wizard state.
- `mcp_IssueCreationWizard_resetState`: Resets the wizard state.
- `mcp_IssueCreationWizard_updateState`: Updates the wizard state (project, issue type, fields, step).
- `mcp_IssueCreationWizard_createIssue`: Creates a Jira issue using the wizard's state.
- `mcp_IssueCreationWizard_getProjects`: Retrieves available Jira projects.
- `mcp_IssueCreationWizard_getIssueTypes`: Gets available issue types for the selected project.
- `mcp_IssueCreationWizard_getFields`: Retrieves fields required for the selected project/issue type.
- `mcp_IssueCreationWizard_updateFields`: Updates specific field values in the wizard state.
- `mcp_IssueCreationWizard_setAnalysisComplete`: Sets the analysis complete flag.
- `mcp_IssueCreationWizard_setUserConfirmation`: Sets the user confirmation flag before creation.
- `mcp_IssueCreationWizard_analyzeIssue`: Analyzes the issue details within the wizard context.

## Development

### Running Tests

Jest is configured for testing. To run the test suite:

```bash
npm test
```

### Code Quality Checks

To run type checking, linting, and tests together:

```bash
npm run check-codebase
```

### Running with MCP Inspector

For local development and testing using the Model Context Protocol Inspector, you can launch the application and pass the required environment variables using the `-e` flag:

```bash
npx @modelcontextprotocol/inspector -e JIRA_BASE_URL=https://your-domain.atlassian.net -e JIRA_USERNAME=your-email@example.com -e JIRA_API_TOKEN=your-api-token -e DEBUG=true node build/index.js
```

_(Ensure you have built the project first if using `build/index.js`)_

## License

This project is licensed under the [Your License Name] License - see the `LICENSE` file for details. (Replace `[Your License Name]` with the actual license, e.g., MIT, ISC)
