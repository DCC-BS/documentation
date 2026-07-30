---
outline: deep
editLink: true
skillParent: dcc-backend
skillName: backend-logger
skillDescription: "dcc_backend_common.logger module for structured logging built on structlog. Use when calling init_logger() at startup and get_logger(__name__), emitting always-on usage events with get_usage_logger(), choosing JSON (IS_PROD) vs colored console output, or tuning FocusedTracebackFormatter / DEV_TRACEBACK_STYLE tracebacks."
---
# Structured Logging

The `dcc_backend_common.logger` module provides structured, consistent logging across all services using [structlog](https://www.structlog.org/).

::: tip Logging Standards
For general logging best practices and standards, see the [Python Coding Standards - Logging](/coding/python#logging) section.
:::

## Overview

The module provides:

- **`init_logger()`**: Initialize the logging system (call once at startup)
- **`get_logger()`**: Get a structured logger instance for any module
- **`get_usage_logger()`**: Get the pinned `usage` logger for usage/audit events
- **`USAGE_LOGGER_NAME`**: The name of that logger (`"usage"`) — use it to filter in OpenSearch
- **`FocusedTracebackFormatter`**: Advanced traceback rendering for development that highlights user code
- **`DevTracebackStyle`**: Configuration options for traceback styles in development mode
- **Automatic context**: Timestamps, module names, function names, and line numbers (plus `request_id` when the [logging middleware](/backend-common/logging_middleware) is installed)
- **Environment-aware rendering**: JSON in production (fluentbit compatible), colored console in development

### One Pipeline for Everything

`init_logger()` installs a **single** handler on the root logger. structlog events *and* stdlib records (uvicorn, third-party libraries, Python warnings) are rendered by the same pipeline, so every line has the same shape:

- Handlers attached by uvicorn / `fastapi-cli` are cleared so records flow through the root handler.
- `uvicorn.access` is disabled entirely (`propagate = False`) — per-request 200 lines are noise for fluentbit/OpenSearch, and the [logging middleware](/backend-common/logging_middleware) reports the failures that matter.
- Chatty libraries (`httpx`, `httpcore`, `openai`, `urllib3`, `aiohttp`) are capped at `WARNING`.
- `logging.captureWarnings(True)` routes `DeprecationWarning` & friends through the pipeline instead of raw stderr.

::: warning Serving
Run with plain `uvicorn`, **not** `fastapi run`. The `fastapi run` Rich banner and handlers bypass the JSON pipeline:

```bash
uvicorn my_app.app:app --host 0.0.0.0 --port 8090 --no-access-log
```
:::

## Installation

The logger module is part of the `dcc-backend-common` package:

```bash
uv add dcc-backend-common
```

## Quick Start

Initialize the logger **once** at your application's entry point:

```python
# app.py
from contextlib import asynccontextmanager

from dcc_backend_common.logger import init_logger, get_logger
from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    init_logger()  # Initialize once at startup
    logger = get_logger(__name__)
    logger.info("Application started")
    yield
    logger.info("Application shutting down")


app = FastAPI(lifespan=lifespan)
```

## Configuration

The logger is configured via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `INFO` | Logging level for **application diagnostics** (`DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`). Does not affect usage events |
| `IS_PROD` | - | Set to `true` for JSON output (fluentbit compatible) |
| `DEV_TRACEBACK_STYLE` | `focused` | Traceback style in development: `focused` (user code locals) or `rich` (all locals) |
| `LOGGER_USER_CODE_PATHS` | `dcc_backend_common, src/, app/, tests/` | Comma-separated paths to identify user code for detailed tracebacks |

### Development vs Production

- **Development** (`IS_PROD` not `true`): Colored console output for readability.
  - **Traceback Styles**:
    - **`focused` (default)**: Shows the full Rich traceback but only displays local variables for frames identified as "user code" (based on `LOGGER_USER_CODE_PATHS`). This reduces noise from library internals.
    - **`rich`**: Shows the full Rich traceback with local variables displayed for **all** frames, including third-party libraries. This is more verbose but useful for deep debugging.
- **Production** (`IS_PROD=true`): JSON output for log aggregation tools like fluentbit. Tracebacks are rendered into a string field by `format_exc_info`.

::: tip Recommended levels
`LOG_LEVEL=debug` on test stages, `LOG_LEVEL=info` in production.
:::

## Usage Events

Usage/audit events go through a separate, **pinned** logger named `usage`. `init_logger()` sets that logger to `INFO` explicitly, so its events survive any `LOG_LEVEL` — even `LOG_LEVEL=WARNING`.

```python
from dcc_backend_common.logger import get_usage_logger

usage_logger = get_usage_logger()
usage_logger.info("app_event", action="translator.translate", pseudonym_id=..., chars=1200)
```

Two producers already use it:

| Producer | Event | Emitted by |
|----------|-------|------------|
| `UsageTrackingService.log_event()` | `app_event` | [Usage Tracking](/backend-common/usage_tracking) |
| `BaseAgent` (every LLM call) | `llm_call` | [LLM Agent](/backend-common/llm_agent) |

In OpenSearch, filter on `logger: "usage"` to separate business events from diagnostics. The constant `USAGE_LOGGER_NAME` holds that name if you need it in code.

::: warning Keep diagnostics out
Do **not** route ordinary application logging through the usage logger — it is never silenced by `LOG_LEVEL`.
:::

## Usage

### Getting a Logger

Use `get_logger()` in any module to get a structured logger:

```python
from dcc_backend_common.logger import get_logger

# Pass the module name for context
logger = get_logger(__name__)


def process_translation(request: TranslationRequest) -> TranslationResult:
    logger.info(
        "Processing translation request",
        source_lang=request.source_lang,
        target_lang=request.target_lang,
        text_length=len(request.text),
    )

    try:
        result = translate(request)
        logger.info("Translation completed", result_length=len(result.text))
        return result
    except TranslationError as e:
        logger.error("Translation failed", error=str(e), request_id=request.id)
        raise
```

### Automatic Context

The logger automatically adds context to every log entry:

| Field | Description |
|-------|-------------|
| `timestamp` | ISO-8601 formatted timestamp (UTC) |
| `logger` | The logger name passed to `get_logger()` |
| `module` | The module name where the log was called |
| `func_name` | The function name |
| `lineno` | The line number |
| `level` | The log level |
| `request_id` | Unique UUID for request tracing — only present when the [logging middleware](/backend-common/logging_middleware) is installed |

Example JSON output in production:

```json
{
  "timestamp": "2024-01-15T10:30:45.123456Z",
  "logger": "myapp.services.translator",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "module": "translator",
  "func_name": "translate",
  "lineno": 42,
  "level": "info",
  "event": "Translation completed",
  "result_length": 256
}
```

## Integration with FastAPI

### Request Logging Middleware

Do **not** hand-roll request logging — the package ships a middleware that binds a `request_id` to every log line emitted while handling a request:

```python
from dcc_backend_common.fastapi_logging_middleware import add_logging_middleware

add_logging_middleware(app)
```

See [Logging Middleware](/backend-common/logging_middleware) for details.

## API Reference

### DevTracebackStyle

Enum defining the available traceback styles for development mode.

| Value | Description |
|-------|-------------|
| `FOCUSED` | Rich traceback + focused locals for user code only (default) |
| `RICH` | Default Rich traceback with full locals for all frames (verbose) |

### FocusedTracebackFormatter

A custom exception formatter used in development mode.

- Shows detailed tracebacks for user code (based on `LOGGER_USER_CODE_PATHS`).
- Keeps library code traces dense and minimal.
- Appends a specific "Local variables in your code" section for user frames.

### init_logger()

Initialize the logger configuration. Must be called once at application startup.

```python
from dcc_backend_common.logger import init_logger

init_logger()
```

**Environment Variables:**
- `IS_PROD`: "true" for production (JSON output), "false" for development (console output).
- `LOG_LEVEL`: Logging level (default: "INFO").
- `DEV_TRACEBACK_STYLE`: Traceback style in dev mode ("focused" or "rich").
- `LOGGER_USER_CODE_PATHS`: Comma-separated paths to consider as user code.

### get_logger(name)

Get a structured logger instance.

```python
from dcc_backend_common.logger import get_logger

logger = get_logger(__name__)  # Pass module name for context
logger = get_logger()  # Or get anonymous logger
```

**Parameters:**
- `name` (str | None): Optional name for the logger, typically `__name__`

**Returns:**
- `BoundLogger`: A structlog bound logger instance

### get_usage_logger()

Get the logger for usage/audit events. Events logged here are always emitted (INFO and up), regardless of `LOG_LEVEL`.

```python
from dcc_backend_common.logger import get_usage_logger

usage_logger = get_usage_logger()
usage_logger.info("llm_call", input_tokens=812, output_tokens=134)
```

**Returns:**
- `BoundLogger`: A structlog bound logger named `usage`

### USAGE_LOGGER_NAME

Module-level constant holding the usage logger's name (`"usage"`). Use it when filtering log records or configuring downstream tooling.

::: tip Source Code
The full implementation is available on GitHub: [dcc_backend_common/logger/logger.py](https://github.com/DCC-BS/backend-common/blob/main/src/dcc_backend_common/logger/logger.py)
:::