---
outline: deep
editLink: true
---

# DSPy Utilities

::: warning Module Removed
The `backend_common.dspy_common` module has been **removed** from the `backend-common` package.
:::

This module previously provided utilities for working with [DSPy](https://dspy.ai/), including base classes, adapters, streaming listeners, and metrics for building LLM-powered applications.

## What Was Removed

The following components were part of the removed module:

- **`AbstractDspyModule`**: Base class that handled adapter selection and streaming boilerplate
- **`DisableReasoningAdapter`**: Adapter for Qwen 3 hybrid reasoning models to disable chain-of-thought
- **`SwissGermanStreamListener`**: Streaming listener that normalized `ß` to `ss`
- **`edit_distance_metric`**: Metric combining WER and CER for DSPy optimization

## Migration Guide

If your project depends on any of these utilities:

1. **Copy the relevant code** from the git history into your own project
2. **Update your imports** to reference your local copies
3. **Maintain separately** if needed for project-specific use cases

The previous implementation can be found in the git history of the [backend-common repository](https://github.com/DCC-BS/backend-common).

::: tip Alternative
Consider maintaining LLM-specific utilities in your own project if they are not shared across multiple services.
:::
