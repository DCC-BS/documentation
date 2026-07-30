---
outline: deep
editLink: true
skillParent: dcc-backend
skillName: backend-probes
skillDescription: "dcc_backend_common.fastapi_health_probes module for Kubernetes health checks. Use when mounting health_probe_router(service_dependencies) to expose /health/liveness, /health/readiness, and /health/startup endpoints with external dependency checks and deduplicated failure logging (Error Signature, First Occurrence, Recovery Summary)."
---
# Health Probes

The `dcc_backend_common.fastapi_health_probes` module provides Kubernetes-ready health check endpoints that follow best practices for container orchestration.

## Overview

The module provides:

- **Liveness Probe**: Checks if the application process is running
- **Readiness Probe**: Checks if the app is ready to handle requests
- **Startup Probe**: Checks if the application has finished initialization
- **Automatic log suppression**: Health endpoints excluded from access logs
- **Dependency health checks**: Configurable external service monitoring
- **Deduplicated failure logging**: A failing dependency is logged once per failure mode, not once per probe

## Installation

The health probes module is part of the `dcc-backend-common` package and needs the `fastapi` extra (it pulls in `fastapi` and `aiohttp`):

```bash
uv add "dcc-backend-common[fastapi]"
```

## Quick Start

```python
from fastapi import FastAPI
from dcc_backend_common.fastapi_health_probes import health_probe_router

app = FastAPI()

# Define external service dependencies
service_dependencies = [
    {
        "name": "database",
        "health_check_url": "http://postgres:5432/health",
        "api_key": None  # Optional API key for authenticated health checks
    },
    {
        "name": "external-api",
        "health_check_url": "https://api.example.com/health",
        "api_key": "your-api-key-here"
    }
]

# Include health probe router
app.include_router(health_probe_router(service_dependencies))
```

## Available Endpoints

### Liveness Probe

**`GET /health/liveness`**

| Aspect | Description |
|--------|-------------|
| **Purpose** | Checks if the application process is running and not deadlocked |
| **K8s Action** | If this fails, the container is **killed and restarted** |
| **Rule** | Keep it simple. Do **NOT** check databases or external dependencies here |

**Response:**

```json
{
  "status": "up",
  "uptime_seconds": 123.45
}
```

### Readiness Probe

**`GET /health/readiness`**

| Aspect | Description |
|--------|-------------|
| **Purpose** | Checks if the app is ready to handle user requests |
| **K8s Action** | If this fails, **traffic stops** being sent to this pod |
| **Rule** | Check critical dependencies here (databases, external APIs, etc.) |

**Response (healthy):**

```json
{
  "status": "ready",
  "checks": {
    "database": "healthy",
    "external-api": "healthy"
  }
}
```

**Response (unhealthy - returns HTTP 503):**

```json
{
  "status": "unhealthy",
  "checks": {
    "database": "error: Cannot connect to host postgres:5432",
    "external-api": "status 503: upstream overloaded"
  },
  "error": "database: error: Cannot connect to host postgres:5432; external-api: status 503: upstream overloaded"
}
```

Every dependency is probed on every readiness call — there is no short-circuit on the first failure, so each dependency's state advances and `checks` always covers all of them. Each entry carries the failure detail: `status {code}[: body]` for a non-200 response, or `error: {message}` for a transport error.

### Startup Probe

**`GET /health/startup`**

| Aspect | Description |
|--------|-------------|
| **Purpose** | Checks if the application has finished initialization |
| **K8s Action** | **Blocks** liveness/readiness probes until this returns 200 |
| **Rule** | Useful for apps that need to load large ML models or caches on boot |

**Response:**

```json
{
  "status": "started",
  "timestamp": "2025-12-04T10:30:00.000000+00:00"
}
```

## Configuration

### Service Dependencies

Define the external services your application depends on:

```python
from dcc_backend_common.fastapi_health_probes.router import ServiceDependency

service_dependencies: list[ServiceDependency] = [
    {
        "name": "llm-service",
        "health_check_url": "http://llm:8080/health",
        "api_key": None
    },
    {
        "name": "ocr-service", 
        "health_check_url": "http://ocr:8080/health",
        "api_key": "secret-key"
    }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | `str` | Human-readable name for the service |
| `health_check_url` | `str` | URL to check for service health |
| `api_key` | `str \| None` | Optional API key sent as Bearer token |

::: warning Import path
Only `health_probe_router` is re-exported from the package. The `ServiceDependency` TypedDict must be imported from `dcc_backend_common.fastapi_health_probes.router`. It is a plain `TypedDict`, so a bare `dict` literal works too.
:::

### Timeouts

The readiness probe uses a **5 second timeout** for each dependency check. Dependencies that don't respond within this time are marked as unhealthy.

## Features

### Automatic Logging Suppression

Health check endpoints are automatically excluded from uvicorn access logs to reduce noise. This prevents log spam from Kubernetes probes hitting your endpoints every few seconds. The [logging middleware](/backend-common/logging_middleware) skips `/health/*` for the same reason.

### Deduplicated Failure Logging

Kubernetes calls the readiness probe every few seconds. Logging every failed probe would bury an outage in thousands of identical lines, so the router runs a small per-dependency state machine and logs only the transitions.

The key concept is the **Error Signature** — a stable key that tells one failure apart from another:

| Failure | Signature |
|---------|-----------|
| Non-200 HTTP response | `http:{status}` (e.g. `http:503`) |
| Transport/connection error | The exception class name (e.g. `ClientConnectorError`) |

The volatile message text is deliberately **excluded** from the signature, so a timeout whose duration changes on every call does not defeat suppression.

State transitions:

| Transition | Log | Level | Event |
|------------|-----|-------|-------|
| healthy → failing | **First Occurrence** — full detail | `ERROR` | `health check failed` |
| failing → same signature | **Suppressed Probe** — silent | — | — |
| failing → different signature | fresh First Occurrence for the new signature | `ERROR` | `health check failed` |
| failing → healthy | **Recovery Summary** | `INFO` | `health check recovered` |

First Occurrence fields: `service`, `signature`, `detail`.

Recovery Summary fields: `service`, `previous_signature`, `outage_duration_s`, `suppressed_probe_count`, `last_error` — so an operator sees how long the **Outage** lasted, how many probes were suppressed, and what the last error was.

```json
{
  "event": "health check recovered",
  "level": "info",
  "service": "llm",
  "previous_signature": "ClientConnectorError",
  "outage_duration_s": 42.317,
  "suppressed_probe_count": 8,
  "last_error": "error: Cannot connect to host llm-service:8080"
}
```

::: tip Per-process state
Dedup state lives in memory for the lifetime of the process, so each pod deduplicates its own probes. A pod restart resets the state and the next failure is logged as a fresh First Occurrence.
:::

### Authentication Support

For services requiring authentication, provide an `api_key`. It will be sent as a Bearer token in the `Authorization` header:

```python
{
    "name": "secure-service",
    "health_check_url": "https://api.example.com/health",
    "api_key": "your-api-key"  # Sent as: Authorization: Bearer your-api-key
}
```

### Kubernetes-Ready Status Codes

| Scenario | HTTP Status | Meaning |
|----------|-------------|---------|
| All checks pass | `200 OK` | Pod is healthy |
| Any dependency fails | `503 Service Unavailable` | Pod should not receive traffic |

## Kubernetes Configuration

Example Kubernetes deployment configuration:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-service
spec:
  template:
    spec:
      containers:
        - name: app
          image: my-service:latest
          ports:
            - containerPort: 8000
          livenessProbe:
            httpGet:
              path: /health/liveness
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 10
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /health/readiness
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5
            failureThreshold: 3
          startupProbe:
            httpGet:
              path: /health/startup
              port: 8000
            initialDelaySeconds: 0
            periodSeconds: 5
            failureThreshold: 30  # Allow 2.5 minutes for slow startups
```

## Complete Example

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI
from dcc_backend_common.config import AppConfig
from dcc_backend_common.logger import init_logger, get_logger
from dcc_backend_common.fastapi_health_probes import health_probe_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    init_logger()
    config = AppConfig.from_env()
    logger = get_logger(__name__)
    logger.info("Application started", config=str(config))
    yield
    logger.info("Application shutting down")


app = FastAPI(lifespan=lifespan)

# Configure health probes with your service dependencies
service_dependencies = [
    {
        "name": "llm",
        "health_check_url": "http://llm-service:8080/health",
        "api_key": None
    },
    {
        "name": "database",
        "health_check_url": "http://postgres:5432/health", 
        "api_key": None
    }
]

app.include_router(health_probe_router(service_dependencies))
```

::: tip Source Code
The full implementation is available on GitHub: [dcc_backend_common/fastapi_health_probes/router.py](https://github.com/DCC-BS/backend-common/blob/main/src/dcc_backend_common/fastapi_health_probes/router.py)
:::
