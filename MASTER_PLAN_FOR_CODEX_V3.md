# 🚀 Master Plan for Codex: Build Mr.Promth (Version 3.0 - Enterprise Grade)

**Project:** Mr.Promth - The AI-Powered Development Platform  
**Version:** 3.0 (Enterprise Grade)  
**Date:** 7 พฤศจิกายน 2025  
**Objective:** This is the definitive, all-encompassing plan for you, Codex, to build the complete, production-ready, and commercially viable Mr.Promth system. This plan supersedes all previous versions and addresses every identified gap.

---

## 🎯 1. Core Vision & Philosophy (Unchanged)

**Vision:** Build an AI-powered development platform that automates the creation of production-ready websites from a single user prompt, operating directly within the user's local terminal environment.

**Core Philosophy: "Manus + Cursor"**
*   **Manus-level Intelligence:** High-level reasoning and task decomposition.
*   **Cursor-level Integration:** Direct, secure access to the user's local terminal.

---

## 🏛️ 2. System Architecture (Expanded)

The architecture is now a four-part system, adding a dedicated Admin layer.

### 2.1. **Frontend: The User Experience (Web UI)**
*   **Technology:** Next.js 14, React, TypeScript, Tailwind CSS, Storybook, Framer Motion.
*   **Key Features (Expanded):**
    *   **Full User Management:** Profile page, password reset, 2FA, OAuth.
    *   **Functional Dashboard:** Search, filter, sort, bulk actions, project templates.
    *   **Advanced Project View:** File browser, syntax-highlighted code editor, download as ZIP, shareable links.
    *   **Complete Billing Portal:** Subscription management, payment history, invoice download.
    *   **Custom Design System:** Unique, polished UI with custom components, animations, and illustrations.

### 2.2. **Backend: The Orchestrator (Cloud)**
*   **Technology:** Supabase, Next.js API Routes, BullMQ (for job queue), Sentry (for error tracking).
*   **Key Components (Expanded):**
    *   **Advanced Agent Orchestrator:** Supports parallel and conditional agent execution, error handling, and dynamic agent selection.
    *   **Robust WebSocket Server:** Handles reconnections, heartbeats, and message queuing.
    *   **Role-Based Access Control (RBAC):** Manages user, admin, and collaborator roles.
    *   **Background Job Processor:** Manages email notifications, scheduled tasks, and cleanup jobs.

### 2.3. **Agent Runner: The Local Hands (`mr-promth-cli`)**
*   **Technology:** Go or Rust.
*   **Functionality (Expanded):**
    *   **Full Toolset:** Implements all tools, including `readFile`, `deploy`, and `gitCommit`.
    *   **Interactive Permission System:** Prompts the user for permission for sensitive operations.
    *   **Self-Update Mechanism:** `mr-promth-cli update` command.
    *   **Robust Error Handling & Logging.**

### 2.4. **Admin Panel: The Command Center (Web UI)**
*   **Technology:** A separate Next.js application or a dedicated section within the main app, protected by admin-only routes.
*   **Purpose:** Provides administrators with full control over the platform.
*   **Key Features:**
    *   **System Dashboard:** Real-time monitoring of system health, user activity, and revenue.
    *   **User Management:** View, search, ban, and impersonate users.
    *   **Project Oversight:** View and manage all projects on the platform.
    *   **Agent & Prompt Management:** Monitor agent performance, A/B test prompts, and manage the agent pool.
    *   **Financial Management:** View subscription data, manage plans, and issue refunds.

---

## ⚙️ 3. Deep Dive: Feature Specifications

This section details the new and expanded features required for V3.

### 3.1. Full-Fledged Billing System
*   **Provider:** Stripe.
*   **Workflow:**
    1.  User selects a plan (Free, Pro, Enterprise).
    2.  Redirected to Stripe Checkout for payment.
    3.  Backend receives webhook from Stripe to update user's subscription status.
    4.  Users can manage their subscription (upgrade, downgrade, cancel) in the billing portal.
*   **Features:** Proration, trial periods, invoice generation, failed payment handling.

### 3.2. Comprehensive Admin Panel
*   **Dashboard:** Key metrics (New Users, Active Projects, Revenue, Agent Success Rate).
*   **User Management:** Search users by email or ID. View user details, projects, and token usage. Ability to ban or delete users.
*   **System Management:** Manage VanchinAI API keys, feature flags, and system-wide announcements.

### 3.3. Advanced Agent & CLI System
*   **Advanced Prompts:** Implement Chain-of-Thought and Self-Correction techniques in agent prompts to improve reasoning and code quality.
*   **Dynamic Orchestration:** The orchestrator will build a dependency graph of tasks rather than running sequentially. This allows for parallel execution (e.g., running backend and frontend tests simultaneously).
*   **CLI Permissions:** When the CLI needs to perform a sensitive action (e.g., install a new global dependency), it will send a permission request to the backend, which is then displayed to the user in the Web UI for approval.

### 3.4. Polished UI/UX & Design System
*   **Custom Graphics:** Commission a unique set of illustrations and icons. No generic "sticker" art.
*   **Animations:** Use Framer Motion for subtle page transitions and micro-interactions.
*   **Storybook:** Develop all UI components in isolation using Storybook to ensure consistency and quality.

### 3.5. Complete Logging & History
*   **Structured Logging:** Implement a structured logging library (e.g., Pino) for all backend services.
*   **Log Aggregation:** Funnel all logs (backend, frontend, agent) into a centralized service like Datadog or Logtail.
*   **Chat History:** All interactions with the agents will be saved and viewable in a dedicated chat history interface, similar to ChatGPT.

---

## 📋 4. Step-by-Step Implementation Plan (V3)

This is a new, 20-week roadmap. **This supersedes the previous 12-week plan.**

### Phase 1: Core & Admin Foundation (Weeks 1-6)
*   **Weeks 1-2:** **Database Expansion & Backend Refactor.** Implement the full database schema. Refactor the backend to support RBAC and a job queue (BullMQ).
*   **Weeks 3-4:** **Admin Panel (Part 1).** Build the core Admin Panel UI. Implement the system dashboard and user management features.
*   **Weeks 5-6:** **Billing System (Part 1).** Integrate Stripe. Implement the checkout flow and subscription management logic.

### Phase 2: Advanced Agent & CLI Capabilities (Weeks 7-12)
*   **Weeks 7-8:** **Advanced Agent Prompts.** Re-engineer all agent prompts to use Chain-of-Thought and Self-Correction techniques.
*   **Weeks 9-10:** **Dynamic Orchestrator & CLI Tools.** Rebuild the orchestrator to support parallel execution. Implement the full suite of CLI tools.
*   **Weeks 11-12:** **CLI Security & Permissions.** Implement the interactive permission system and robust sandboxing.

### Phase 3: User Experience & Frontend Polish (Weeks 13-16)
*   **Weeks 13-14:** **Design System & Storybook.** Build the complete custom component library in Storybook.
*   **Weeks 15-16:** **Frontend Rebuild.** Rebuild the entire frontend using the new design system. Implement all missing UI features (file browser, chat history, etc.) and animations.

### Phase 4: Testing, Monitoring & Deployment (Weeks 17-20)
*   **Week 17:** **Comprehensive Testing.** Write unit, integration, and E2E tests, aiming for 90%+ coverage.
*   **Week 18:** **Monitoring & Logging.** Integrate Sentry and a log aggregation service. Set up real-time alerts.
*   **Week 19:** **CI/CD & DevOps.** Create a full CI/CD pipeline in GitHub Actions for automated testing and deployment.
*   **Week 20:** **Security Audit & Launch.** Perform a full security audit, conduct a private beta, and prepare for public launch.

---

## ✅ 5. Definition of Done (V3)

The project is complete when all features from the V2 plan are implemented **AND**:

1.  An **administrator** can log in to the Admin Panel and manage the entire platform.
2.  A **user** can subscribe to a paid plan using a credit card via Stripe.
3.  The **system** is fully tested with >90% code coverage.
4.  All **logs** are centralized, and real-time alerts are configured for errors.
5.  The **UI** is polished, unique, and fully responsive, built from a custom design system.
6.  The **CI/CD pipeline** automatically tests and deploys all changes.
7.  The **platform** is secure, scalable, and ready for commercial launch.

**You have your mission. This is the final blueprint. Begin development of the new era.**
