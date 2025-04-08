# Jira MCP Toolset (Placeholder Title - Replace with actual package name)

A collection of tools designed for interacting with Jira via the Model Context Protocol (MCP), providing core Jira functionalities and a guided Issue Creation Wizard.

## Installation

To install this into a client:

```bash
{
  "mcpServers": {
    "JiraMCP_Published": {
      "command": "npx",
      "args": [
        "@timbreeding/jira-mcp-server@latest",
        "--jira-base-url=https://example.atlassian.net",
        "--jira-username=someJiraUserEmail@domain.com",
        "--jira-api-token=<your jira token>"
      ],
      "env": {
        "DEBUG": "true",
        "LOG_FILE_PATH": "" // Some full path. If blank, it will not write logs to a file.
      }
    }
  }
}

```

## Usage
...
## Configuration

### Environment Variables
 For running locally, you can put the DEBUG and LOG_FILE_PATH into your .env.

## Available Tools

This application exposes the following tools via the Model Context Protocol:

### Core Jira Tools

- `getJiraIssue`: Fetches a Jira issue by its key.
- `analyzeJiraIssue`: Performs comprehensive analysis of a Jira issue.
- `jiraGet`: Fetches data from any Jira API GET endpoint.
- `getIssuesByJql`: Searches for Jira issues using a JQL query.

### Issue Creation Wizard Tools

These tools provide a step-by-step, guided process for creating new Jira issues. The wizard maintains state throughout the creation flow, typically involving these stages: initiating the process, selecting a project (`getProjects`), choosing an issue type (`getIssueTypes`), retrieving and populating the necessary fields (`getFields`, `updateFields`), optionally analyzing the issue details, and finally confirming and creating the issue (`createIssue`). Use `getState` and `getStatus` to monitor progress, and `resetState` to start over.

- `issueCreation_getState`: Gets the current internal state of the wizard.
- `issueCreation_getStatus`: Gets the high-level status of the wizard.
- `issueCreation_initiateState`: Initializes a new wizard state.
- `issueCreation_resetState`: Resets the wizard state.
- `issueCreation_updateState`: Updates the wizard state (project, issue type, fields, step).
- `issueCreation_createIssue`: Creates a Jira issue using the wizard's state.
- `issueCreation_getProjects`: Retrieves available Jira projects.
- `issueCreation_getIssueTypes`: Gets available issue types for the selected project.
- `issueCreation_getFields`: Retrieves fields required for the selected project/issue type.
- `issueCreation_updateFields`: Updates specific field values in the wizard state.
- `issueCreation_setAnalysisComplete`: Sets the analysis complete flag.
- `issueCreation_setUserConfirmation`: Sets the user confirmation flag before creation.
- `issueCreation_analyzeIssue`: Analyzes the issue details within the wizard context.

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

This project is licensed under the MIT License - see the `LICENSE` file for details.
