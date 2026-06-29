---
outline: deep
editLink: true
---

# AI Assisted Coding

This documentation repository does more than host a static website—it also compiles and publishes reusable **AI Coding Agent Skills** for tools like **Claude Code**, **Antigravity**, and **Cursor**. 

By packaging our developer guidelines directly into the `.agents/` folder structure, coding agents working on DCC repositories can automatically understand and enforce our internal design system, coding standards, environment variable rules, and infrastructure.

---

## ⚖️ Basel-Stadt AI Guidelines (KI-Richtlinie)

All AI-assisted coding and development within DCC projects must strictly adhere to the official **Kanton Basel-Stadt AI Guidelines (KI-Richtlinie)**.

> [!IMPORTANT]
> Verify that all AI tools used and the code generated comply with the official policies on data protection, security, and usage constraints.
> Read the complete guidelines here: [Kanton Basel-Stadt KI-Richtlinie](https://www.bs.ch/schwerpunkte/daten/databs/schwerpunkte/kuenstliche-intelligenz/ki-richtlinie)

---

## 🚀 Recommended Public Agent Tools & Skills

In addition to our internal DCC agent skills, we recommend installing the following public skills and MCP servers to improve your AI agent's productivity and prevent API hallucinations when writing frontend/backend code.

### 1. Official Nuxt & Nuxt UI Skills
Nuxt and Nuxt UI provide specialized knowledge files (skills) that teach your AI assistant about component APIs, props, theming, and best practices.

* **Reference:** [Nuxt UI AI Skills Documentation](https://ui.nuxt.com/docs/getting-started/ai/skills)
* **Nuxt UI Skill Installation:**
  ```bash
  # Install Nuxt UI v4 skill for your editor/agent
  npx skills add nuxt/ui
  ```
* **General Nuxt Skill Installation:**
  ```bash
  # Install general Nuxt framework guidelines (e.g. from the community)
  npx skills add antfu/skills --skill nuxt
  ```
  *Note: The CLI will ask which local editor/agent (Cursor, Claude Code, etc.) you want to install the skill to.*

### 2. Context7 MCP Server (Up-to-Date Documentation)
[Context7](https://context7.com/) is an open-source Model Context Protocol (MCP) server by Upstash that fetches fresh, version-specific documentation for popular libraries (like Next.js, Zod, Tailwind, etc.) and injects it directly into your AI assistant. This removes AI hallucinations when using external libraries.

* **Cursor Setup:**
  1. Open **Cursor Settings** > **Features** > **MCP**.
  2. Click **+ Add New MCP Server**.
  3. Set Name to `context7`, Type to `command`, and enter:
     * **Command:** `npx`
     * **Arguments:** `-y @upstash/context7-mcp`
* **Claude Code Setup:**
  Run the plugin installation commands inside your terminal:
  ```bash
  /plugin marketplace add upstash/context7
  /plugin install context7@context7-marketplace
  ```
  *(Alternatively, run `npx ctx7 setup --claude`)*

---

## 🛠️ PR Automation & Quality Checks

We use AI integrations directly inside our Pull Requests to automate code reviews and keep documentation in sync with code updates.

### 1. CodeRabbit (PR Reviews)
[CodeRabbit](https://coderabbit.ai/) is integrated into our repositories as an automated code reviewer. When you open a Pull Request, CodeRabbit will:
* Review your changes and provide inline suggestions.
* Summarize the pull request details.
* Ensure code standards and conventions are upheld.

### 2. The `/documentation` Comment Command
When you submit a PR containing code changes, you can automatically update this documentation repository by commenting `/documentation` on the PR. You can also append free-text instructions in quotes to steer the update, e.g. `/documentation "Make sure the docs reflect the updated API."`

An LLM analyses your code diff against the existing docs, opens (or updates) a single documentation PR for your source PR, and comments back on your PR with a summary and a link. Follow-up `/documentation` comments refine the same documentation PR.

> [!TIP]
> Setup, authentication (GitHub App), and the trigger workflow are documented in detail under [Git / GitHub / CI/CD → LLM Documentation Auto-Update](/dev-setup/git#llm-documentation-auto-update-documentation).

---

## 📦 Available Unified Agent Skills

When using a compatible agent in a DCC repository, the following core skills are compiled and loaded:

| Skill ID | Purpose & Trigger | Nested Reference Sub-Skills |
| :--- | :--- | :--- |
| **`varlock`** | Environment variable schema, secret injection, and validation with the varlock tool. | *None (Standalone)* |
| **`docker`** | Containerization, Dockerfile structure, and docker-compose setups. | *None (Standalone)* |
| **`dcc-ui`** | Reusable `common-ui.bs.js` Vue components, composables, and the Kanton Basel-Stadt design system. | `disclaimer`, `disclaimer-button`, `disclaimer-page`, `changelogs`, `databs-footer`, `navigation-bar`, `online-status`, `split-container`, `split-view`, `undo-redo-buttons`, `useUserFeedback` |
| **`dcc-coding`**| Development standards for DCC backend and frontend. | `nuxt` (Nuxt/Vue/TS conventions), `python` (Python coding conventions) |
| **`dcc-backend`**| `dcc-backend-common` shared library modules for FastAPI services. | `backend-config`, `backend-logger`, `backend-error-handler`, `backend-probes`, `backend-usage-tracking`, `backend-llm-agent` |
| **`dcc-nuxt-layers`**| Reusable Nuxt layers shared across DCC projects via `extends`. | `nuxt-layer-auth`, `nuxt-layer-backend-communication`, `nuxt-layer-feedback-control`, `nuxt-layer-health-check`, `nuxt-layer-logger` |

---

## 📥 Installing Skills in a Project

To load these guidelines inside your local project workspace, run this command from the repository root:

```bash
curl -sSL https://dcc-bs.github.io/documentation/install-skills.sh | bash
```

This downloads `dcc-skills.zip` and extracts the `.agents` folder into your current repository where agents like Claude Code, Antigravity, and Cursor can immediately read them.

---

## ✍️ Adding or Modifying Skills

Skills are dynamically generated from markdown source files using YAML frontmatter properties.

### Standalone Skills
Add properties to a standalone page (e.g. [varlock.md](file:///home/yanick/code/documentation/markdown/dev-setup/varlock.md)):
```yaml
---
skillName: varlock
skillDescription: Guidelines for using Varlock environment variables setup in Nuxt/Frontend and Python/Backend.
---
```

### Parent Skills
Add properties to a module index file (e.g. [user-interface/index.md](file:///home/yanick/code/documentation/markdown/user-interface/index.md)):
```yaml
---
skillName: dcc-ui
skillDescription: Master guide for DCC UI components, design systems, layouts, and helper composables.
---
```

### Child Sub-Skills
Link individual files (e.g. [useUserFeedback.md](file:///home/yanick/code/documentation/markdown/user-interface/composables/useUserFeedback.md)) to their parent:
```yaml
---
skillParent: dcc-ui
skillName: useUserFeedback
skillDescription: Standard composable for toast notifications, confirmation dialogs, and error handling.
---
```
