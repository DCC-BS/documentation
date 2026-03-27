---
outline: deep
description: Comprehensive guide to setting up your local development environment.
---

# Development Setup

This guide provides a condensed overview of the tools and configurations required to contribute to our projects. We prioritize speed, type safety, and modern workflows.

## 1. Core Runtime & Package Managers

We use **uv** for Python and **Bun** for JavaScript/TypeScript to ensure the fastest possible dependency resolution and execution.

| Tool | Purpose | Installation |
|------|---------|--------------|
| **[uv](https://docs.astral.sh/uv/)** | Python package & project management | [Installation Guide](https://docs.astral.sh/uv/getting-started/installation/) |
| **[Bun](https://bun.sh/)** | JS/TS runtime & package management | [Installation Guide](https://bun.sh/docs/installation) |

- **Python Version:** We target **Python 3.13**.
- **Node.js Version:** Managed via Bun.

## 2. Containerization

All applications must be runnable via Docker. For security, we strictly use **Rootless Docker**.

- **[Docker Rootless](https://docs.docker.com/engine/security/rootless/):** Mandatory for local development and production. [Follow the official installation steps](https://docs.docker.com/engine/security/rootless/).
- **[NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html):** Required if you are working with AI models or GPU-accelerated services.
- **Docker Compose:** Used for orchestrating multi-container environments (e.g., Frontend + Backend + Database).

::: tip Standards
Review our [Internal Docker Standards](/docker) for Dockerfile patterns and orchestration strategies.
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

- **Git Workflow:** We follow [GitHub Flow](/git#git-workflow).
- **Security:** Always use **SHA pinning** for GitHub Actions. See [Security Standards](/git#security).
- **Dependency Cooldowns:** We enforce a 7-day cooldown for new package versions to prevent supply chain attacks. This is pre-configured in `pyproject.toml` (uv) and `bunfig.toml` (Bun).

## 5. Local Project Initialization

Once your environment is set up, you can typically start a project with:

```bash
# For Python projects
uv sync
uv run main.py

# For Nuxt projects
bun install
bun run dev
```

Check the `README.md` of the specific repository for project-specific instructions and required `.env` variables.
