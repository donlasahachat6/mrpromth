# Supabase Connector Capabilities Brief

**Date:** November 10, 2025
**Author:** Manus AI

## 1. Introduction

This document provides a comprehensive overview of the Supabase integration capabilities available within this project. There are two primary ways the system can interact with Supabase:

1.  **Internal Database Connector (`UnifiedDatabase`):** An abstraction layer built into the `mrpromth` project code. It's designed for application-specific tasks like managing chat sessions, user data, and workflows.
2.  **External MCP Connector:** A set of general-purpose tools available via the Model Context Protocol (MCP) server. This connector is designed for administrative and management tasks related to your Supabase account and projects, such as managing projects, running migrations, and checking logs.

## 2. Internal Database Connector (`UnifiedDatabase`)

This is the primary connector used by the `mrpromth` application for its day-to-day database operations. I have successfully tested this connector, and the results are detailed in the main response.

### Key Capabilities

*   **Automatic Mode Switching:** The connector intelligently detects if Supabase credentials are provided in the environment. 
    *   If **configured**, it connects to your live Supabase database.
    *   If **not configured**, it automatically falls back to an in-memory **Mock Database**. This is excellent for development and testing, as it allows the application to run without a live database connection.

*   **Simplified Data Access:** It provides a clean, high-level API for common application tasks, abstracting away the raw SQL or complex queries. This makes the code easier to read and maintain.

*   **Core Features Demonstrated:** The test script successfully demonstrated the following operations using the `UnifiedDatabase` connector in Mock Mode:
    *   **Configuration Detection:** Correctly identified that it was running in `MOCK` mode.
    *   **Chat Session Management:** Created new chat sessions and fetched existing ones for a user.
    *   **Chat Message Management:** Created user and assistant messages within a session and fetched the conversation history.
    *   **Workflow Management:** Created a new workflow, updated its status, and fetched the updated record.
    *   **Raw Client Access:** Showed that the underlying `DatabaseClient` can also be used for more direct, generic `insert` and `select` operations.

### How to Use It

Within the project's code, you can import and use the `unifiedDb` instance directly.

```typescript
// Import the pre-configured instance
import { unifiedDb } from './lib/database/unified-db';

// Example: Get all chat sessions for a user
async function getUserSessions(userId: string) {
  const sessions = await unifiedDb.getChatSessions(userId);
  console.log(sessions);
}

// Example: Create a new workflow
async function createNewWorkflow(userId: string) {
  const workflow = await unifiedDb.createWorkflow(
    userId,
    'My New Project',
    'A prompt describing the project'
  );
  console.log('Workflow created:', workflow.id);
}
```

## 3. External MCP Connector

This connector provides powerful administrative tools to manage your Supabase account and projects directly through natural language commands. While I was unable to execute these tools due to a missing access token for the MCP server, I was able to retrieve a full list of their capabilities.

### Key Capabilities

This connector is organized into several categories:

| Category | Tools | Description |
| :--- | :--- | :--- |
| **Project Management** | `list_projects`, `get_project`, `create_project`, `pause_project`, `restore_project` | Allows for full lifecycle management of your Supabase projects, from creation to pausing and restoring. |
| **Database Management** | `list_tables`, `list_extensions`, `execute_sql`, `apply_migration`, `list_migrations` | Provides tools to inspect your database schema, run raw SQL queries, and manage database migrations for schema changes. |
| **Branching (Dev/Prod)** | `create_branch`, `list_branches`, `delete_branch`, `merge_branch`, `rebase_branch` | Supports development workflows by allowing you to create, manage, and merge development branches. |
| **Authentication & Keys** | `get_publishable_keys` | Retrieves API keys for your project, essential for connecting your frontend application. |
| **Diagnostics & Health** | `get_logs`, `get_advisors`, `get_project_url` | Tools for debugging and monitoring your project's health, including fetching logs and getting security/performance advice. |
| **Code & Types** | `generate_typescript_types`, `list_edge_functions`, `deploy_edge_function` | Helps with development by generating TypeScript types from your schema and managing serverless Edge Functions. |
| **Documentation** | `search_docs` | A powerful tool to search the official Supabase documentation using GraphQL to find guides and references. |
| **Billing** | `get_cost`, `confirm_cost` | Allows you to check the cost of new projects or branches and confirm the charges before proceeding. |

### How to Use It

Once the MCP server is configured with an access token, you can use these tools by making requests in natural language. 

**Example Prompts:**

*   "*List all of my Supabase projects.*" (Uses `list_projects`)
*   "*Execute a SQL query to count the users in the 'profiles' table for the project 'mrpromth'.*" (Uses `execute_sql`)
*   "*Check for any security advisories on my main project.*" (Uses `get_advisors`)
*   "*Generate TypeScript types for my project.*" (Uses `generate_typescript_types`)
