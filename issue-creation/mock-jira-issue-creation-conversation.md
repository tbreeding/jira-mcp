# Mock Conversation: Creating a Jira Issue with AI Assistance

This document presents a realistic mock conversation between a user and an AI Agent, demonstrating how the Jira issue creation process would work through natural conversation.

## Conversation Start

**User**: I need to create a new bug report in Jira for that rendering issue we found yesterday.

**AI Agent**: I can help you create a new Jira issue. I'll guide you through the process step by step. Let me start the issue creation wizard.

*[AI uses mcp_IssueCreationWizard_initiateState]*

**AI Agent**: I've started the issue creation process. First, let's select which project this bug should be created in. Here are the available projects:

*[AI uses mcp_IssueCreationWizard_getProjects]*

**AI Agent**: Here are the projects you have access to:
- **BACKEND** - Backend Services
- **FRONTEND** - Frontend Applications
- **INFRA** - Infrastructure
- **MOBILE** - Mobile Apps
- **QA** - Quality Assurance

Which project should this bug be filed under?

**User**: I think it should go in FRONTEND since it's a UI rendering problem.

**AI Agent**: Thanks, I'll select the FRONTEND project for this issue.

*[AI uses mcp_IssueCreationWizard_updateState to set project=FRONTEND]*

**AI Agent**: Now let's determine what type of issue to create. For the FRONTEND project, these issue types are available:

*[AI uses mcp_IssueCreationWizard_getIssueTypes]*

**AI Agent**: Here are the available issue types for FRONTEND:
- **Bug** - A problem that impairs product functionality
- **Task** - A task that needs to be done
- **Story** - A user story
- **Epic** - A large body of work that can be broken down
- **Improvement** - An enhancement to an existing feature

You mentioned this is a bug report, so shall I select the Bug issue type?

**User**: Yes, it's definitely a Bug.

**AI Agent**: I've selected Bug as the issue type.

*[AI uses mcp_IssueCreationWizard_updateState to set issueType=10004 (Bug)]*

**AI Agent**: Now I need to collect the required information for this bug report. Let me check what fields are needed.

*[AI uses mcp_IssueCreationWizard_getFields]*

**AI Agent**: For a Bug in the FRONTEND project, I need the following information:
- **Summary** (required): A brief, descriptive title for the bug
- **Description** (required): Detailed information about the bug
- **Priority** (required): How urgent this issue is (Highest, High, Medium, Low, Lowest)
- **Affects Version** (optional): Which version of the software has this bug
- **Assignee** (optional): Who should work on this bug

Let's start with the summary. What would you like to call this bug?

**User**: Let's call it "Dashboard charts fail to render when filtering by date range"

**AI Agent**: Great. Now I need a description. Could you provide details about:
- What you were doing when you encountered the bug
- What you expected to happen
- What actually happened
- Any error messages you saw
- Steps to reproduce the issue

**User**: Sure. When filtering the dashboard charts by date range (using the date picker in the top right), the charts disappear completely instead of updating with the filtered data. No error messages appear in the UI, but the console shows a JavaScript error: "TypeError: Cannot read property 'data' of undefined". This happens consistently when selecting any custom date range. It works fine with the preset ranges like "Last 7 days" or "This month".

**AI Agent**: Thank you for those details. What priority would you assign to this bug? Options are Highest, High, Medium, Low, or Lowest.

**User**: I'd say High priority since it's affecting a core feature of the dashboard that many people use.

**AI Agent**: Thanks. Do you know which version this affects? And is there anyone specific who should be assigned to this bug?

**User**: It's in version 2.4.0 which we released last week. Let's assign it to Sarah since she worked on the dashboard filters recently.

**AI Agent**: Thank you. I'll update the issue with all this information.

*[AI uses mcp_IssueCreationWizard_updateFields to set the field values]*

**AI Agent**: Here's a summary of the bug report I'm about to create:

- **Project**: FRONTEND
- **Issue Type**: Bug
- **Summary**: Dashboard charts fail to render when filtering by date range
- **Description**: When filtering the dashboard charts by date range (using the date picker in the top right), the charts disappear completely instead of updating with the filtered data. No error messages appear in the UI, but the console shows a JavaScript error: "TypeError: Cannot read property 'data' of undefined". This happens consistently when selecting any custom date range. It works fine with the preset ranges like "Last 7 days" or "This month".
- **Priority**: High
- **Affects Version**: 2.4.0
- **Assignee**: Sarah

Does this look correct, or would you like to make any changes before I create the issue?

**User**: That looks good, but I just realized we should also mention that this is only happening in Chrome. Firefox seems to work fine.

**AI Agent**: I'll update the description to include that information.

*[AI uses mcp_IssueCreationWizard_getState to check current state]*

*[AI uses mcp_IssueCreationWizard_updateFields to update the description field]*

**AI Agent**: I've updated the description to include that the issue only occurs in Chrome and works fine in Firefox. Here's the final version I'll submit:

- **Project**: FRONTEND
- **Issue Type**: Bug
- **Summary**: Dashboard charts fail to render when filtering by date range
- **Description**: When filtering the dashboard charts by date range (using the date picker in the top right), the charts disappear completely instead of updating with the filtered data. No error messages appear in the UI, but the console shows a JavaScript error: "TypeError: Cannot read property 'data' of undefined". This happens consistently when selecting any custom date range. It works fine with the preset ranges like "Last 7 days" or "This month". NOTE: This issue only occurs in Chrome browsers. Firefox renders the charts correctly with custom date filters.
- **Priority**: High
- **Affects Version**: 2.4.0
- **Assignee**: Sarah

Shall I go ahead and create this issue now?

**User**: Yes, please create it.

*[AI uses mcp_IssueCreationWizard_createIssue]*

**AI Agent**: Great! I've successfully created the bug report in Jira. 

- **Issue Key**: FRONTEND-421
- **Issue URL**: https://yourcompany.atlassian.net/browse/FRONTEND-421

The issue has been assigned to Sarah and she'll receive a notification. Is there anything else you'd like me to do with this bug report?

**User**: That's perfect, thanks! Could you also remind me how to find all the dashboard-related bugs we've filed so far?

**AI Agent**: To find all dashboard-related bugs, you can use the Jira Query Language (JQL). Here's a query you can use:

```
project = FRONTEND AND issuetype = Bug AND summary ~ "dashboard" ORDER BY created DESC
```

You can run this in Jira's search box or use the "Advanced" option in the search interface. This will show all bugs in the FRONTEND project that have "dashboard" in their summary, sorted by creation date with the newest issues first.

Would you like me to run this query for you now?

**User**: No, that's okay. I'll check it later. Thanks for your help!

**AI Agent**: You're welcome! Let me know if you need any other assistance with Jira issues in the future.

*[AI uses mcp_IssueCreationWizard_resetState to clean up]*

## Key Aspects Demonstrated

This mock conversation demonstrates several important aspects of the Jira Issue Creation Wizard integration:

1. **State Management**: The conversation maintains state throughout the interaction, with each step building on previous choices (project selection → issue type selection → field completion).

2. **Progressive Disclosure**: Information is presented to the user in manageable chunks rather than overwhelming them with all fields at once.

3. **Natural Language Interaction**: Users can communicate in natural language rather than filling out forms or using specific commands.

4. **Guided Experience**: The AI provides structure to the process by explaining what information is needed and why.

5. **Flexibility**: The conversation allows for revisions (adding browser details) and handles cases where users provide different levels of detail.

6. **Error Prevention**: The AI confirms details before final submission, ensuring accuracy and giving users a chance to correct mistakes.

7. **Tool Orchestration**: Behind the scenes, the AI coordinates multiple tool calls to create a seamless experience for the user.

8. **Context Awareness**: The AI remembers previously provided information (e.g., that this is a bug report) without requiring the user to repeat themselves.

9. **Clean Slate**: At the end of the process, the wizard state is reset, ensuring the next interaction starts fresh.

This approach transforms what could be a tedious form-filling exercise into a collaborative conversation, making the issue creation process more accessible and user-friendly. 