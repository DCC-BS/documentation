---
outline: deep
---

# Internal Docker Standards

This document outlines the mandatory standards and best practices for containerizing applications within our organization. These guidelines ensure consistency, security, and performance across all projects.

# 1. Project Initialization & Structure

Every project must be containerized. The root of the repository must contain the necessary configuration to build and run the application independently.

## File Requirements

`Dockerfile`: Defines the build process.

`.dockerignore`: Excludes unnecessary files from the build context.

`docker-compose.yml`: Defines the production/integration infrastructure.

`docker-compose.dev.yml`: Defines the local development environment.

## The .dockerignore File

To optimize build speed and security, you must exclude all files not required for the application runtime. This prevents secrets (`.env`) and local build artifacts (`node_modules`) from accidentally entering the image.

### Standard Exclusion List:
```
.git
.vscode
.editorconfig
.env
README.md
Dockerfile
docker-compose*.yml
node_modules
__pycache__
.pytest_cache
.nuxt
dist
```

# 2. Dockerfile Development

## Base Images & Tagging

* No `latest` tags: Never depend on the `latest` tag. It is mutable and leads to non-reproducible builds.
* Pin Versions: Use specific version tags (e.g., `node:24-alpine` or `python:3.13-alpine`).

* Minimal Base Images: Prefer `alpine` or `slim` (only if `alpine` fails) variants to reduce image size and download time.

## Multi-Stage Builds

Use multi-stage builds to separate build dependencies (compilers, headers, full CLI tools) from runtime dependencies.

1. Build Layer: Compiles code, installs dependencies, builds assets.

2. Run Layer: Copies only the artifacts from the Build Layer.

## Security Context

* Rootless Execution: Containers should not run as root. Create a specific user or use the default non-root user provided by the base image (e.g., `node` user in Node images).

* Privileged Mode: Do not run containers in `--privileged` mode.

* Kubernetes pod security standards prohibit "run as root" containers.

### Examples

# Node.js / Nuxt (Bun)
```
# Stage 1: Build
FROM node:24-alpine AS build

# Install Bun
RUN npm install -g bun

WORKDIR /app

# Dependency caching layer
COPY package.json package-lock.json ./
RUN bun install --frozen-lockfile

# Build layer
COPY . .
RUN bun x nuxi prepare
RUN bun x nuxi build

# Stage 2: Runtime
FROM node:24-alpine

WORKDIR /app

# Security: Set non-root user
USER node

# Copy artifacts
COPY --from=build --chown=node:node /app/.output ./

EXPOSE 3000
ENV NODE_ENV=production

ENTRYPOINT ["node", "./server/index.mjs"]
```

### Python (Alpine)
```
# Stage 1: Builder
FROM python:3.13-alpine as builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install build dependencies (Alpine uses apk)
RUN apk add --no-cache gcc musl-dev

COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Stage 2: Runtime
FROM python:3.13-alpine

WORKDIR /app

# Create non-root user (Alpine syntax)
RUN addgroup -S appuser && adduser -S appuser -G appuser

COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .

RUN pip install --no-cache /wheels/*

COPY . .
RUN chown -R appuser:appuser /app

USER appuser

CMD ["python", "main.py"]
```

# 3. Orchestration & Composition

We utilize a modular Docker Compose strategy to avoid duplication between development and production configurations.

### The "Extends" Pattern

* `docker/services.compose.yml`: The base definition. Contains image names, build contexts, and shared environment variables.

* `dockercompose.dev.yml`: Extends the base. Adds hot-reloading (volumes), debugging ports, and local overrides.

* `dockercompose.yaml`: Extends the base. Defines production networks, restart policies, and resource limits.

### Example Directory Structure:
```
project-root/
├── docker/
│   └── services.compose.yml
├── dockercompose.dev.yml
├── dockercompose.yaml
```

### Syntax Reference:
```
# dockercompose.dev.yml
services:
  backend:
    extends:
      file: ./docker/services.compose.yml
      service: backend
    environment:
      - DEBUG=true
```

# 4. Quality Assurance & Optimization

## Static Analysis & Linting

* SonarQube: Ensure Dockerfiles are scanned during the CI process to detect security smells (e.g., hardcoded secrets, sudo usage).

* [Hadolint](https://github.com/hadolint/hadolint): Recommended for local linting of Dockerfile syntax.

### Installation

* Windows: scoop install hadolint

* Ubuntu:

```
sudo wget -qO /usr/local/bin/hadolint https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-x86_64

sudo chmod a+x /usr/local/bin/hadolint
```


### Usage

* Local CLI: hadolint Dockerfile

## Image Optimization

* Size Analysis: Use [Dive](https://github.com/wagoodman/dive) to inspect image layers and identify wasted space.

* Layer Caching: Leverage the build cache by ordering instructions from stable to volatile. Copy dependency definitions (e.g., package.json) and install packages before copying the source code to avoid re-installing dependencies on every code change.

* Clean Artifacts: Clear package manager caches (e.g., apk cache clean, rm -rf /var/lib/apt/lists/*) within the same RUN instruction as the installation to prevent temporary files from committing to the layer.

* Further Reading: [Guide to Reducing Docker Image Size](https://devopscube.com/reduce-docker-image-size/)

# 5. Deployment & CI/CD

## Registry

* Images are pushed to GHCR (GitHub Container Registry).

* Namespace convention: ghcr.io/dcc-bs/<service-name>.

## Versioning Strategy

* Development: Tag with the branch name or dev.

* Staging/Production: Tag with the Git Commit SHA (sha-xyz123) and the Semantic Version (v1.0.0).

* Avoid Overwriting: Do not overwrite stable tags.

## CI Workflow

* Checkout Code.

* Lint Dockerfile (Hadolint/SonarQube).

* Build Image (using BuildKit).

* Run Tests against the container.

* Push to GHCR.

# 6. Docker Configuration (Host)

* Rootless Daemon: Run the Docker daemon in rootless mode to mitigate privilege escalation vulnerabilities on the host machine.

* Resource Limits: Configure global resource quotas to prevent a single container from exhausting host memory or CPU.