---
outline: deep
editLink: true
skillParent: dcc-backend
skillName: backend-logging-middleware
skillDescription: "dcc_backend_common.fastapi_logging_middleware module for per-request log correlation. Use when adding add_logging_middleware(app) / LoggingMiddleware to bind a request_id from the X-Request-ID header into the structlog context, emit one request_finished / request_failed event per request (method, route-template path, status_code, duration_s), and exclude health probes or other high-frequency paths."
---
# Logging Middleware

The `dcc_backend_common.fastapi_logging_middleware` module correlates every log line emitted while handling a request with a single `request_id`, and emits one completion event per request.

## Overview

The module provides:

- **`add_logging_middleware(app)`**: One-liner registration on a FastAPI app
- **`LoggingMiddleware`**: The underlying Starlette `BaseHTTPMiddleware` subclass
- **Request correlation**: Binds `request_id` into the structlog contextvars, so *every* log line during the request carries it
- **One completion event per request**: `request_finished` (INFO) for every response including 4xx/5xx, `request_failed` (ERROR) for unhandled exceptions; CORS preflights (`OPTIONS`) are not logged
- **Health-probe exclusion**: paths starting with `/health` emit no `request_finished` (they still get a `request_id` and still log `request_failed` when they raise); configurable via `excluded_paths`

## Installation

Part of the `dcc-backend-common` package; the FastAPI pieces need the `fastapi` extra:

```bash
uv add "dcc-backend-common[fastapi]"
```

## Quick Start

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI
from dcc_backend_common.logger import init_logger, get_logger
from dcc_backend_common.fastapi_logging_middleware import add_logging_middleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_logger(app_name="my-app")
    yield


app = FastAPI(lifespan=lifespan)
add_logging_middleware(app)

logger = get_logger(__name__)


@app.get("/translate")
async def translate():
    # This line automatically carries the same request_id as any other
    # log emitted while handling this request.
    logger.info("translating", target_lang="en")
    return {"ok": True}
```

## Behaviour

### Request ID

| Step | Behaviour |
|------|-----------|
| Incoming | Reads the `X-Request-ID` request header |
| Missing | Generates a new UUID4 |
| During the request | Bound into the structlog context (`structlog.contextvars`), so every log line includes `request_id` |
| Outgoing | Echoed back in the `X-Request-ID` response header |

The context is cleared at the start of each request, so IDs never leak between requests handled by the same worker.

::: tip Tracing across services
Forward the `X-Request-ID` header when calling downstream services to correlate a single user action across the whole stack.
:::

### What Gets Logged

| Situation | Level | Event | Fields |
|-----------|-------|-------|--------|
| Any response (including 4xx/5xx) | `INFO` | `request_finished` | `method`, `path`, `status_code`, `duration_s` |
| Unhandled exception | `ERROR` | `request_failed` | `method`, `path`, `status_code` (500), `duration_s`, `error`, `error_type`, `exception` (traceback) |
| Excluded path or `OPTIONS`, no exception | — | *not logged* | — |

`path` is the route template (`/items/{item_id}`), never the concrete URL, and `<unmatched>` for 404s: it is a terms bucket in OpenSearch and must stay low-cardinality and free of user data. For streaming responses `duration_s` is time-to-first-byte, not total transfer time.

Exceptions are re-raised after logging, so your [error handler](/backend-common/error_handler) still shapes the response.

Records are emitted under the logger name `request`, so you can filter on `logger: "request"` in OpenSearch.

Example production output:

```json
{
  "timestamp": "2026-11-20T09:12:03.481920Z",
  "level": "info",
  "app": "translator-backend",
  "logger": "request",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "event": "request_finished",
  "method": "POST",
  "path": "/api/translate",
  "status_code": 422,
  "duration_s": 0.031
}
```

### Excluded Paths

Requests whose raw path or route template starts with an excluded prefix (default `/health`) emit no `request_finished`. They still get a `request_id`, and they still log `request_failed` when they raise, since probe failures are what alerting needs. Kubernetes polls these every few seconds, and the [health probe router](/backend-common/probes) does its own deduplicated failure logging.

Exclude more polling endpoints by route template, and include the default when overriding:

```python
add_logging_middleware(app, excluded_paths={"/health", "/task/{task_id}/status"})
```

## API Reference

### add_logging_middleware(app, *, excluded_paths=None)

Register the middleware on a FastAPI application.

```python
from dcc_backend_common.fastapi_logging_middleware import add_logging_middleware

add_logging_middleware(app)
```

**Parameters:**
- `app` (`FastAPI`): The application instance
- `excluded_paths` (`set[str] | None`): Prefixes matched against the raw URL path and the route template; matching requests emit no `request_finished` (they still emit `request_failed` on exceptions). Defaults to `{"/health"}`

**Returns:** `None`

### LoggingMiddleware

The `BaseHTTPMiddleware` subclass behind `add_logging_middleware()`. Add it directly if you need to control middleware ordering:

```python
from dcc_backend_common.fastapi_logging_middleware import LoggingMiddleware

app.add_middleware(LoggingMiddleware)
```

::: tip Ordering
Register it early (outermost) so the `request_id` is bound before other middleware logs anything.
:::

### Module Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `REQUEST_ID_HEADER` | `"X-Request-ID"` | Header read on the way in and echoed on the way out |
| `DEFAULT_EXCLUDED_PATHS` | `frozenset({"/health"})` | Default excluded prefixes |
| `UNMATCHED_PATH` | `"<unmatched>"` | `path` value when no route matched (404) |

The constants live in `dcc_backend_common.fastapi_logging_middleware.middleware`; the package itself exports only `LoggingMiddleware` and `add_logging_middleware`.

## Related Documentation

- [Logger](/backend-common/logger) — the structlog pipeline this middleware feeds
- [Health Probes](/backend-common/probes) — the excluded endpoints and their own dedup logging
- [Error Handler](/backend-common/error_handler) — shaping the response for failed requests

::: tip Source Code
The full implementation is available on GitHub: [dcc_backend_common/fastapi_logging_middleware/middleware.py](https://github.com/DCC-BS/backend-common/blob/main/src/dcc_backend_common/fastapi_logging_middleware/middleware.py)
:::
