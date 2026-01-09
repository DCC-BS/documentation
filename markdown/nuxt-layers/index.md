---
outline: deep
editLink: true
---

# Nuxt Layers

> **📦 Repository**: [github.com/DCC-BS/nuxt-layers](https://github.com/DCC-BS/nuxt-layers)

Nuxt Layers are a powerful feature that allows you to share and reuse partial Nuxt
applications across multiple projects. This repository contains reusable Nuxt layers
specifically designed for DCC-BS applications.

## What are Nuxt Layers?

Nuxt layers enable you to extend the default files, configs, and much more in a
Nuxt application. Think of them as composable building blocks that can include:

- Components
- Composables
- Layouts
- Middleware
- Pages
- Plugins
- Server routes and middleware
- Configuration

A layer is almost identical to a standard Nuxt application structure, making them
easy to author and maintain. When you extend a layer, Nuxt automatically scans and
integrates these directories into your application.

### How Layers Work

Layers are extended in your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  extends: [
    ['github:DCC-BS/nuxt-layers/auth', { install: true }],
    ['github:DCC-BS/nuxt-layers/health_check', { install: true }]
  ]
})
```

When multiple layers define the same files or components, the **priority order**
matters:

1. **Your project files** - highest priority (always wins)
2. **First layer in extends** - overrides later layers
3. **Second layer in extends** - lower priority
4. And so on...

This means your project can always override layer behavior by defining the same
file locally.

## When to Use Layers vs NPM Packages

At DCC-BS, we follow these guidelines:

### Use **Nuxt Layers** when

- ✅ The code is **dependent on DCC-BS applications** and their specific architecture
- ✅ The code needs to integrate deeply with Nuxt (components, middleware, server
routes)
- ✅ You need plug-and-play functionality that can be switched via environment variables
- ✅ The code is specific to our internal infrastructure (auth, monitoring, etc.)

### Use **NPM Packages** when:

- ✅ The code is **independent** and framework-agnostic
- ✅ The code is **generic enough** to be reused in non-Nuxt projects
- ✅ You want to publish utilities that don't need Nuxt-specific features
- ✅ The code should be versioned and distributed via npmjs.com

**Example**: Our authentication system uses layers because it's deeply integrated
with Nuxt and can be switched between implementations (Azure AD, no-auth) using
environment variables. However, a generic date formatting utility would be better
as an NPM package.

## Available Layers

### 🔐 Auth Layer

The base authentication layer that provides plug-and-play authentication switching.
Use environment variables to choose between Azure AD authentication or no-auth mode.

**Key Feature**: Switch authentication implementations without changing code!

[Learn more about Auth →](./auth.md)

### 🔌 Backend Communication

Server-side utilities for communicating with backend APIs. Provides a fluent builder
API for creating type-safe API handlers in your Nuxt server routes.

[Learn more about Backend Communication →](./backend_communication.md)

### 📝 Logger

Universal logging layer with pluggable implementations. Switch between console-based logging for development and production-ready implementations like Pino using environment variables.

**Key Feature**: Type-safe logging interface that works in both browser and server environments!

[Learn more about Logger →](./logger.md)

### 💬 Feedback Control

A plug-and-play feedback widget that collects user feedback and posts it directly to GitHub as issues. Features emoji ratings, file attachments, and multi-language support (DE/EN).

**Key Feature**: No backend required for storage—leverages the GitHub API directly!

[Learn more about Feedback Control →](./feedback_control.md)

### 💚 Health Check

Kubernetes-ready health check endpoints for container orchestration. Provides
`/health/liveness`, `/health/readiness`, and `/health/startup` endpoints.

[Learn more about Health Checks →](./health_check.md)

## Quick Start

### 1. Add Layers to Your Project

In your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  extends: [
    ['github:DCC-BS/nuxt-layers/logger', { install: true }],
    ['github:DCC-BS/nuxt-layers/auth', { install: true }],
    ['github:DCC-BS/nuxt-layers/backend_communication', { install: true }],
    ['github:DCC-BS/nuxt-layers/health_check', { install: true }],
    ['github:DCC-BS/nuxt-layers/feedback-control', { install: true }]
  ]
})
```

### 2. Configure Environment Variables

Create a `.env` file:

```sh
# Backend API URL
API_URL=https://api.example.com

# Choose authentication implementation
AUTH_LAYER_URI=github:DCC-BS/nuxt-layers/azure-auth

# Choose logger implementation (e.g., pino-logger)
LOGGER_LAYER_URI=github:DCC-BS/nuxt-layers/pino-logger

# Feedback Control Configuration
FEEDBACK_REPO=your-repo-name
FEEDBACK_REPO_OWNER=your-username
FEEDBACK_PROJECT=your-project-name
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

### 3. Use Layer Features

The layers automatically provide composables, server utilities, and endpoints you
can use immediately.

## Architecture Overview

Our layers work together in a cohesive system:

```txt
┌─────────────────────────────────────────┐
│         Your Nuxt Application           │
├─────────────────────────────────────────┤
│  Logger Layer (base)                    │
│    ├─ Pino Logger (implementation)      │
│    └─ (future: other loggers)           │
│                                         │
│  Auth Layer (base)                      │
│    ├─ Azure Auth (implementation)       │
│    └─ No Auth (implementation)          │
│                                         │
│  Backend Communication                  │
│    └─ Used by auth implementations      │
│                                         │
│  Health Checks                          │
│                                         │
│  Feedback Control                       │
└─────────────────────────────────────────┘
```

- **Logger Layer** provides the interface and dynamically loads an implementation
based on `LOGGER_LAYER_URI`
- **Logger Implementations** (pino-logger) extend the base and provide logging
functionality for both client and server
- **Auth Layer** provides the interface and dynamically loads an implementation
based on `AUTH_LAYER_URI`
- **Auth Implementations** (azure-auth/no-auth) extend the base and provide
`authHandler` for authenticated API calls
- **Backend Communication** offers utilities used by auth layers and available for
custom server routes
- **Health Checks** operates independently for monitoring
- **Feedback Control** provides a `<FeedbackControl />` component and server API
to send feedback to GitHub

## Repository Structure

The [nuxt-layers repository](https://github.com/DCC-BS/nuxt-layers) contains:

```txt
nuxt-layers/
├── logger/                 # Base logger layer
├── pino-logger/            # Pino implementation
├── auth/                   # Base auth layer
├── azure-auth/             # Azure AD implementation
├── no-auth/                # No-auth implementation
├── backend_communication/  # API communication utilities
├── feedback-control/       # Feedback widget & GitHub integration
├── health_check/           # Health check endpoints
├── package.json           # Workspace configuration
├── tsconfig.json          # TypeScript config
└── biome.json             # Code formatting config
```

Each directory is a standalone layer that can be extended independently.

## Development

The repository uses Bun as a monorepo workspace. To develop layers locally:

```sh
# Clone the repository
git clone https://github.com/DCC-BS/nuxt-layers.git

# Install dependencies
bun install

# Work on individual layers
cd auth && bun dev
```

## Learn More

- [Nuxt Layers Documentation](https://nuxt.com/docs/guide/going-further/layers) - Official Nuxt documentation
- [Logger Layer](./logger.md) - Universal logging with pluggable implementations
- [Auth Layer Details](./auth.md) - Learn about authentication switching
- [Backend Communication](./backend_communication.md) - API communication utilities
- [Feedback Control](./feedback_control.md) - User feedback widget integration
- [Health Checks](./health_check.md) - Monitoring endpoints