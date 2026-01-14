---
outline: deep
editLink: true
---

# Structured Logging

The `backend_common.logger` module provides structured, consistent logging across all services using [structlog](https://www.structlog.org/).

::: tip Logging Standards
For general logging best practices and standards, see the [Python Coding Standards - Logging](/coding/python#logging) section.
:::

## Overview

The module provides:

- **`init_logger()`**: Initialize the logging system (call once at startup)
- **`get_logger()`**: Get a structured logger instance for any module
- **Automatic context**: Request IDs, timestamps, module names, and line numbers
- **Environment-aware rendering**: JSON in production (fluentbit compatible), colored console in development

## Installation

The logger module is part of the `backend-common` package:

```bash
uv add ddc-backend-common
```

## Quick Start

Initialize the logger **once** at your application's entry point:

```python
# app.py
from contextlib import asynccontextmanager

from backend_common.logger import init_logger, get_logger
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
| `LOG_LEVEL` | `INFO` | Logging level (`DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`) |
| `IS_PROD` | - | Set to `true` for JSON output (fluentbit compatible) |

### Development vs Production

- **Development** (`IS_PROD` not `true`): Colored console output for readability
- **Production** (`IS_PROD=true`): JSON output for log aggregation tools like fluentbit

## Usage

### Getting a Logger

Use `get_logger()` in any module to get a structured logger:

```python
from backend_common.logger import get_logger

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
| `timestamp` | ISO-8601 formatted timestamp |
| `request_id` | Unique UUID for request tracing |
| `module` | The module name where the log was called |
| `func_name` | The function name |
| `lineno` | The line number |
| `level` | The log level |

Example JSON output in production:

```json
{
  "timestamp": "2024-01-15T10:30:45+0000",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "module": "myapp.services.translator",
  "func_name": "translate",
  "lineno": 42,
  "level": "info",
  "event": "Translation completed",
  "result_length": 256
}
```

## Integration with FastAPI

### Request Logging Middleware

Create middleware to log all incoming requests:

```python
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import time

from backend_common.logger import get_logger

logger = get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()
        
        response = await call_next(request)
        
        duration_ms = (time.perf_counter() - start_time) * 1000
        logger.info(
            "Request completed",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=round(duration_ms, 2),
        )
        
        return response


# Register in app.py
app.add_middleware(RequestLoggingMiddleware)
```

## API Reference

### init_logger()

Initialize the logger configuration. Must be called once at application startup.

```python
from backend_common.logger import init_logger

init_logger()
```

### get_logger(name)

Get a structured logger instance.

```python
from backend_common.logger import get_logger

logger = get_logger(__name__)  # Pass module name for context
logger = get_logger()  # Or get anonymous logger
```

**Parameters:**
- `name` (str | None): Optional name for the logger, typically `__name__`

**Returns:**
- `BoundLogger`: A structlog bound logger instance

::: tip Source Code
The full implementation is available on GitHub: [backend_common/logger/logger.py](https://github.com/DCC-BS/backend-common/blob/main/src/backend_common/logger/logger.py)
:::
