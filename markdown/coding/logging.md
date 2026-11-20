---
outline: deep
description: The JSON log contract every DCC-BS service follows so logs from all apps share one OpenSearch index.
editLink: true
skillParent: dcc-coding
skillName: logging-contract
skillDescription: "Cross-app JSON log contract for DCC-BS services (FastAPI via dcc_backend_common.logger, Nuxt via nuxt-layers/pino-logger): reserved fields and their types, level names, closed event vocabulary, error fields, request_id correlation, required env vars. Use when adding logging to a service, writing an OpenSearch query or dashboard, or reviewing log calls."
---
# Logging Contract

All KIW apps ship their stdout to the same daily OpenSearch index (`tenant-kdkp-kiw-logs-*`). Fluent Bit parses each JSON line into `log_json.*`, and OpenSearch fixes a field's type the first time it sees it in each daily index. If two apps write the same field name with different types (a number in one, a string in another), the index gets a **mapping conflict**: Discover fails and queries on that field break for every app.

This contract defines the fields every service writes, and their types. Our shared libraries implement it, so an app that uses them is compliant without extra work:

- **Python / FastAPI**: [`dcc_backend_common.logger`](/backend-common/logger) + [logging middleware](/backend-common/logging_middleware)
- **Nuxt**: [`nuxt-layers/pino-logger`](/nuxt-layers/logger)

Third-party apps (Open WebUI, Firecrawl, Docling, vLLM) are not bound by it; the index template absorbs their fields.

## Rules

1. **One JSON object per line on stdout.** No log files, no multi-line output, no colored console output in deployed environments.
2. **Reserved fields have exactly the type listed below**, in every app.
3. **Custom fields are flat scalars** (string, number, boolean) with one type per field name across all apps. Do not log nested objects or arrays; flatten them (`status_code`, not `response: {status: ...}`) or serialize them to a string. As a safety net, `dcc_backend_common.logger` serializes nested values in custom fields to a JSON string (other objects via `str()`) in production.
4. **Never reuse a reserved field name** for something else (e.g. `error` as an object, `level` as a number, `time` as epoch millis).
5. **No secrets, prompts, document contents or personal data** in any field. Log ids, sizes and counts instead.

## Reserved Fields

| Field | Type | Required | Content |
|-------|------|----------|---------|
| `timestamp` | string | yes | ISO-8601 in UTC, e.g. `2026-11-20T08:15:30.123Z` |
| `level` | string | yes | One of `debug`, `info`, `warning`, `error`, `critical` (lowercase) |
| `message` | string | yes* | Human-readable text |
| `event` | string | no | Closed vocabulary for dashboards and monitors, see [Events](#events) |
| `app` | string | yes | Service name, e.g. `text-mate-backend`, `text-mate-frontend` |
| `logger` | string | yes | Logger name (Python module, or `ssr` / `api` in Nuxt) |
| `request_id` | string | when available | UUID from the `X-Request-ID` header |
| `error` | string | on errors | Short error text (`str(exc)`, `err.message`) |
| `error_type` | string | on errors | Exception class name, e.g. `TimeoutError` |
| `exception` | string | on errors | Full traceback / stack as one string |
| `method` | string | HTTP logs | HTTP method |
| `path` | string | HTTP logs | Route template in FastAPI (`/items/{item_id}`, `<unmatched>` for 404s); in Nuxt the request path without query string |
| `status_code` | integer | HTTP logs | HTTP status |
| `duration_s` | number | HTTP logs | Duration in seconds |

\* A line carries `message`, `event`, or both.

If a value under `status_code` or `duration_s` cannot be converted losslessly to the listed type (e.g. `"OK"`), `dcc_backend_common.logger` moves it to `status_code_raw` / `duration_s_raw` as a string so the reserved field keeps its type. It coerces the other reserved fields to strings, and turns an exception passed as `error=exc` into `error` (`str(exc)`) plus `error_type`.

`module`, `func_name` and `lineno` (Python) are allowed extras with the obvious types.

### Level names

Use exactly the five names above. Libraries with other names map onto them:

| Source | Maps to |
|--------|---------|
| pino `trace` / `debug` | `debug` |
| pino `warn` | `warning` |
| pino `fatal` | `critical` |

## Events

`event` is a **closed vocabulary**: dashboards and alerting monitors term-match and aggregate on it, which only works while it stays a small, fixed set. Free text goes into `message`.

| Event | Emitted by |
|-------|------------|
| `request_finished` / `request_failed` | logging middleware |
| `app_event` | usage logger (`log_event`) |
| `llm_call` | usage logger |
| `health check failed` / `health check recovered` | health probe router |

Apps extend it with `init_logger(extra_event_types={...})`. In Nuxt, `event` is set explicitly in the log object and must follow the same rule.

## Correlation

- Backends bind `request_id` from `X-Request-ID` via the logging middleware.
- Frontends forward `X-Request-ID` on every backend call, so one user action can be followed across frontend and backend in OpenSearch.
- Forward the header when calling downstream services.

## Configuration per environment

| Variable | App type | Value in k8s |
|----------|----------|--------------|
| `IS_PROD` | Python | `true` (JSON output; required, `init_logger` fails without it) |
| `LOG_LEVEL` | Python | `debug` on test, `info` on uat / prod |
| `NODE_ENV` | Nuxt | `production` (JSON output; set by the production image) |
| `NUXT_PUBLIC_LOGGER_LOGLEVEL` | Nuxt | `debug` on test, `info` or `warn` on uat / prod |

Run Python services with plain `uvicorn ... --no-access-log`, not `fastapi run` (its Rich handlers bypass the JSON pipeline).

## Example

```json
{"timestamp":"2026-11-20T08:15:30.123Z","level":"error","app":"text-mate-backend","logger":"text_mate.services.check","request_id":"550e8400-e29b-41d4-a716-446655440000","message":"Language check failed","error":"Connection refused","error_type":"ConnectError","exception":"Traceback (most recent call last): ..."}
```

## Querying

In OpenSearch Dashboards (Discover or Dev Tools), filter on `log_json.app` and `log_json.level`:

```
log_json.app:"text-mate-backend" and log_json.level:(error or critical)
```
