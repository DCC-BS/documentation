---
outline: deep
editLink: true
skillParent: dcc-backend
skillName: backend-usage-tracking
skillDescription: "dcc_backend_common.usage_tracking module for privacy-compliant usage events. Use when logging events with UsageTrackingService.log_event() and pseudonymizing user IDs via HMAC-SHA256 (get_pseudonymized_user_id) for OpenSearch-compatible structured logs."
---
# Usage Tracking

The `dcc_backend_common.usage_tracking` module provides a service for tracking and logging usage events compatible with OpenSearch functionality, with built-in user pseudonymization for privacy compliance.

## Overview

The module provides:

- **`UsageTrackingService`**: Main service class for tracking application usage events
- **User pseudonymization**: One-way HMAC-based hashing of user IDs for privacy
- **Structured logging**: Events logged in a format compatible with OpenSearch
- **Flexible event data**: Support for custom key-value pairs in event logs
- **Always emitted**: Events go through the pinned `usage` logger, so `LOG_LEVEL` never silences them

## Where the Events Go

`UsageTrackingService` writes to the `usage` logger (see [Logger — Usage Events](/backend-common/logger#usage-events)), not to your module logger. That logger is pinned to `INFO` in `init_logger()`, so business events survive even `LOG_LEVEL=WARNING`.

Fields are flat, snake_case, top-level keys, so OpenSearch can aggregate on them without nested paths. Filter on `logger: "usage"` and `event: "app_event"` to isolate them.

Example production output:

```json
{
  "timestamp": "2025-07-14T09:12:03.481920Z",
  "logger": "usage",
  "level": "info",
  "event": "app_event",
  "action": "document_processor.extract_text",
  "pseudonym_id": "9f2c1b...",
  "document_type": "pdf",
  "page_count": 10
}
```

## Installation

The usage tracking module is part of the `dcc-backend-common` package:

```bash
uv add dcc-backend-common
```

## Quick Start

```python
from dcc_backend_common.usage_tracking import UsageTrackingService

# Initialize the service with an HMAC secret
usage_tracking = UsageTrackingService(hmac_secret="your-secret-key")

# Log a usage event
usage_tracking.log_event(
    module="my_module",
    func="process_data",
    user_id="user123",
    data_size=1024,
    processing_time=0.5
)
```

## API Reference

### UsageTrackingService

The main service class for tracking usage events.

#### Initialization

```python
UsageTrackingService(hmac_secret: str)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `hmac_secret` | `str` | Secret key used for HMAC-based pseudonymization of user IDs |

Raises `ValueError` if `hmac_secret` is empty or the literal string `"none"` — an unset secret would make every pseudonym trivially reproducible, so the service refuses to start instead.

**Example:**

```python
from dcc_backend_common.usage_tracking import UsageTrackingService

usage_tracking = UsageTrackingService(hmac_secret="your-hmac-secret-key")
```

#### get_pseudonymized_user_id

Generates a consistent, one-way pseudonym for a given user ID using HMAC-SHA256.

```python
get_pseudonymized_user_id(user_id: str | None) -> str
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | `str \| None` | The user ID to pseudonymize. If `None`, returns pseudonym for "unknown" |

**Returns:** `str` - A hexadecimal HMAC-SHA256 hash of the user ID

**Example:**

```python
pseudonym = usage_tracking.get_pseudonymized_user_id("user123")
# Returns: "a1b2c3d4e5f6..." (consistent hash)

# Unknown users
pseudonym = usage_tracking.get_pseudonymized_user_id(None)
# Returns: pseudonym for "unknown"
```

**Features:**

- **One-way**: Cannot be reversed to obtain the original user ID
- **Consistent**: Same user ID always produces the same pseudonym
- **Privacy-compliant**: Suitable for GDPR and privacy regulations

#### log_event

Logs a usage event with structured data compatible with OpenSearch.

```python
log_event(
    module: str,
    func: str,
    user_id: str | None,
    **kwargs: str | int | float | bool | None
) -> None
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `module` | `str` | The module name where the event occurred |
| `func` | `str` | The function name where the event occurred |
| `user_id` | `str \| None` | The user ID (will be pseudonymized automatically) |
| `**kwargs` | `str \| int \| float \| bool \| None` | Additional event data as flat top-level key-value pairs |

Emits an `app_event` record with:

| Field | Value |
|-------|-------|
| `event` | `"app_event"` |
| `action` | `"{module}.{func}"` |
| `pseudonym_id` | HMAC-SHA256 of the user ID |
| *(your kwargs)* | Merged in as top-level keys |

::: warning Scalars only
Keep `**kwargs` to `str`, `int`, `float`, `bool` or `None`. Nested dicts and lists defeat OpenSearch aggregation, which is the point of the flat shape. Never pass raw user content or unhashed user identifiers.
:::

**Example:**

```python
usage_tracking.log_event(
    module="document_processor",
    func="extract_text",
    user_id="user123",
    document_type="pdf",
    page_count=10,
    processing_time_ms=250.5,
    success=True
)
```


## Configuration

### HMAC Secret

The HMAC secret should be:
- **Secure**: Use a strong, randomly generated secret
- **Consistent**: Same secret across all application instances for consistent pseudonymization
- **Stored securely**: Use environment variables or secret management systems

The built-in [`AppConfig`](/backend-common/config) already exposes it as `hmac_secret` (from `HMAC_SECRET`), so wire the service from config rather than reading the environment again:

```python
config = AppConfig.from_env()
usage_tracking = UsageTrackingService(hmac_secret=config.hmac_secret)
```

::: warning Rotating the secret
Changing the secret changes every pseudonym, breaking continuity of per-user analysis across the rotation point.
:::

## Related Documentation

- [Logger](/backend-common/logger#usage-events) — the pinned `usage` logger these events use
- [Configuration](/backend-common/config) — where `hmac_secret` comes from
- [LLM Agent](/backend-common/llm_agent#usage-logging) — the other producer on the `usage` logger

::: tip Source Code
The full implementation is available on GitHub: [dcc_backend_common/usage_tracking/usage_tracking.py](https://github.com/DCC-BS/backend-common/blob/main/src/dcc_backend_common/usage_tracking/usage_tracking.py)
:::
