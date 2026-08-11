---
outline: deep
description: Comprehensive guide to setting up your local development environment.
---

# Development Setup

This guide provides a condensed overview of the tools and configurations required to contribute to our projects. We prioritize speed, type safety, and modern workflows.

## 1. Core Runtime & Package Managers

We use **[mise](https://mise.jdx.dev/)** to pin and activate the exact runtime
versions in every project, **uv** for Python package management, and **Bun** for
JavaScript/TypeScript. Install mise once; entering a project directory activates
the pinned `bun`, `node`, `python`, and `uv` automatically (run `mise trust` the
first time). See the [mise tooling standard](/dev-setup/mise) for the canonical
versions and task names.

| Tool | Purpose | Installation |
|------|---------|--------------|
| **[mise](https://mise.jdx.dev/)** | Runtime version manager + task runner (every project's entry point) | [Getting Started](https://mise.jdx.dev/getting-started.html) |
| **[uv](https://docs.astral.sh/uv/)** | Python package & project management | [Installation Guide](https://docs.astral.sh/uv/getting-started/installation/) |
| **[Bun](https://bun.sh/)** | JS/TS runtime & package management | [Installation Guide](https://bun.sh/docs/installation) |

- **Python Version:** Pinned to **3.13** via mise (`python = "3.13"` in `mise.toml`).
- **Node.js / Bun Versions:** Pinned via mise (`node = "24.9.0"`, `bun = "1.3.0"`).
- **Tasks:** Every project is driven through `mise run <task>` (`install`, `dev`, `check`, `test`, …) — see the [standard task names](/dev-setup/mise#standard-task-names).

## 2. Containerization

All applications must be runnable via Docker. For security, we strictly use **Rootless Docker**.

- **[Docker Rootless](https://docs.docker.com/engine/security/rootless/):** Mandatory for local development and production. [Follow the official installation steps](https://docs.docker.com/engine/security/rootless/).
- **[NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html):** Required if you are working with AI models or GPU-accelerated services.
- **Docker Compose:** Used for orchestrating multi-container environments (e.g., Frontend + Backend + Database).

::: tip Standards
Review our [Internal Docker Standards](/coding/docker.md) for Dockerfile patterns and orchestration strategies.
:::

## 3. IDE & Tooling

We recommend **VS Code** with the following tools for a consistent experience:

- **[Ruff](https://docs.astral.sh/ruff/):** For Python linting and formatting (extremely fast).
- **[Biome](https://biomejs.dev/):** For JavaScript/TypeScript linting and formatting.
- **[Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss):** Essential for our UI development.

::: info Coding Standards
Ensure you follow our language-specific guidelines:
- [Python Coding Standards](/coding/python)
- [Nuxt.js + TypeScript Coding Standards](/coding/nuxt)
:::

## 4. Git & Workflow

- **Git Workflow:** We follow [GitHub Flow](/dev-setup/development-workflow#git-workflow).
- **Security:** Always use **SHA pinning** for GitHub Actions. See [Security Standards](/dev-setup/development-workflow#security).
- **Dependency Cooldowns:** We enforce a 7-day cooldown for new package versions to prevent supply chain attacks. This is pre-configured in `pyproject.toml` (uv) and `bunfig.toml` (Bun).

## 5. Local Project Initialization

Once your environment is set up, every project is driven through mise. After
`mise trust`, the `postinstall` hook runs automatically; otherwise start with
`mise run install`:

```bash
# Any project — install dependencies and prepare the environment
mise run install

# Start the dev server (Python or Nuxt)
mise run dev

# Run checks / tests
mise run check
mise run test:unit
```

Run `mise tasks` to see all tasks available in a project. Check the `README.md`
of the specific repository for project-specific instructions and required `.env`
variables.

## 6. Environment Variables & Secrets

We use **Varlock** for AI-safe `.env` file management with schema validation, type-safety, and secret injection from password managers.

- **[Varlock Setup Guide](/dev-setup/varlock)** - Detailed setup for Nuxt and Python projects
