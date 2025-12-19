---
outline: deep
editLink: true
---

# DSPy Utilities

The `backend_common.dspy_common` module provides utilities for working with [DSPy](https://dspy.ai/) - a framework for programming language models. It includes base classes, adapters, streaming listeners, and metrics for building LLM-powered applications.

## Overview

The module provides:

- **`AbstractDspyModule`**: Base class that handles adapter selection and streaming boilerplate
- **`DisableReasoningAdapter`**: Adapter for Qwen 3 hybrid reasoning models to disable chain-of-thought
- **`SwissGermanStreamListener`**: Streaming listener that normalizes `ß` to `ss`
- **`edit_distance_metric`**: Metric combining WER and CER for DSPy optimization

## Installation

The DSPy utilities are part of the `backend-common` package:

```bash
uv add backend-common
```

You'll also need DSPy installed:

```bash
uv add dspy
```

## AbstractDspyModule

The `AbstractDspyModule` is a base class that wraps DSPy modules with:

- **Automatic adapter selection**: Switches between reasoning and no-reasoning modes
- **Streaming normalization**: Converts `StreamResponse` objects to plain text
- **Clean API**: Subclasses only implement the DSPy logic, not the boilerplate

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    AbstractDspyModule                        │
├─────────────────────────────────────────────────────────────┤
│  forward(reasoning=False, **kwargs)                          │
│    └── Creates dspy.context with appropriate adapter         │
│        └── Calls predict_with_context(**kwargs)              │
│                                                              │
│  stream(reasoning=False, **kwargs)                           │
│    └── Creates dspy.context with appropriate adapter         │
│        └── Calls stream_with_context(**kwargs)               │
│            └── Normalizes chunks to plain text               │
└─────────────────────────────────────────────────────────────┘
```

### Implementing a Custom Module

Subclasses implement two methods:

| Method | Purpose |
|--------|---------|
| `predict_with_context(**kwargs)` | Single prediction logic |
| `stream_with_context(**kwargs)` | Streaming prediction logic |

**Example - Translation Module:**

```python
import dspy
from collections.abc import AsyncIterator
from dspy.streaming.messages import StreamResponse

from backend_common.config import AppConfig
from backend_common.dspy_common.module import AbstractDspyModule
from backend_common.dspy_common.stream_listener import SwissGermanStreamListener
from backend_common.logger import get_logger


class TranslationSignature(dspy.Signature):
    """Translate text between languages."""

    source_text = dspy.InputField(desc="Input text to translate")
    source_language = dspy.InputField(desc="Source language")
    target_language = dspy.InputField(desc="Target language")
    domain = dspy.InputField(desc="Domain or subject area")
    tone = dspy.InputField(desc="Tone or style for translation")
    glossary = dspy.InputField(desc="Glossary definitions")
    context = dspy.InputField(desc="Previous translations for consistency")
    translated_text = dspy.OutputField(desc="Translated text")


class TranslationModule(AbstractDspyModule):
    def __init__(self, app_config: AppConfig):
        super().__init__()
        self.predict = dspy.Predict(TranslationSignature)
        
        # Setup streaming with Swiss German normalization
        stream_listener = SwissGermanStreamListener(
            signature_field_name="translated_text",
            allow_reuse=True
        )
        self.stream_predict = dspy.streamify(
            self.predict,
            stream_listeners=[stream_listener]
        )
        self.logger = get_logger(__name__)

    def predict_with_context(self, **kwargs: object) -> dspy.Prediction:
        """Execute single prediction."""
        return self.predict(**kwargs)

    async def stream_with_context(self, **kwargs: object) -> AsyncIterator[StreamResponse]:
        """Stream prediction chunks."""
        output = self.stream_predict(**kwargs)
        async for chunk in output:
            self.logger.debug("Received chunk", chunk=str(chunk))
            yield chunk
```

### Usage

```python
module = TranslationModule(app_config)

# Single prediction
result = module.forward(
    source_text="Hallo zusammen!",
    source_language="de",
    target_language="en",
    domain="general",
    tone="formal",
    glossary="",
    context="",
    reasoning=False,  # Set True to enable chain-of-thought reasoning
)
print(result.translated_text)

# Streaming prediction
async for text_chunk in module.stream(
    source_text="Hallo zusammen!",
    source_language="de",
    target_language="en",
    domain="general",
    tone="formal",
    glossary="",
    context="",
):
    print(text_chunk, end="", flush=True)
```

### Reasoning Mode

The `reasoning` parameter controls whether chain-of-thought reasoning is enabled:

| `reasoning` | Adapter | Use Case |
|-------------|---------|----------|
| `False` (default) | `DisableReasoningAdapter` | Fast responses, no reasoning output |
| `True` | `dspy.ChatAdapter` | Enable reasoning for complex tasks |

## DisableReasoningAdapter

The `DisableReasoningAdapter` is a custom DSPy adapter that disables reasoning output for **Qwen 3 hybrid reasoning models** by appending a `\no_think` suffix to the user prompt.

### Why This Exists

Qwen 3 models support hybrid reasoning - they can produce chain-of-thought reasoning or direct responses. The `\no_think` token tells the model to skip reasoning and respond directly, which:

- Reduces token usage
- Speeds up responses
- Removes reasoning artifacts from output

### Usage

The adapter is automatically selected when you call `forward()` or `stream()` with `reasoning=False`:

```python
# Uses DisableReasoningAdapter automatically
result = module.forward(reasoning=False, **kwargs)

# Uses standard ChatAdapter
result = module.forward(reasoning=True, **kwargs)
```

### Direct Usage

You can also use the adapter directly with DSPy's context:

```python
from backend_common.dspy_common.adapters import DisableReasoningAdapter
import dspy

adapter = DisableReasoningAdapter()

with dspy.context(adapter=adapter):
    # All predictions in this block use no-reasoning mode
    result = predictor(**kwargs)
```

## SwissGermanStreamListener

The `SwissGermanStreamListener` is a DSPy stream listener that normalizes German text by replacing the sharp S (`ß`) with double S (`ss`).

### Why This Exists

Swiss German orthography doesn't use `ß` - it always uses `ss` instead. This listener ensures LLM output follows Swiss German conventions.

### Usage

```python
from backend_common.dspy_common.stream_listener import SwissGermanStreamListener
import dspy

# Create listener for a specific output field
stream_listener = SwissGermanStreamListener(
    signature_field_name="translated_text",
    allow_reuse=True
)

# Use with dspy.streamify
stream_predict = dspy.streamify(
    predictor,
    stream_listeners=[stream_listener]
)
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `signature_field_name` | `str` | The output field to normalize |
| `allow_reuse` | `bool` | Whether the listener can be reused across multiple streams |

### What It Normalizes

The listener processes both:
- **Content chunks**: The actual streamed output text
- **Reasoning fields**: Any reasoning output from the model

| Input | Output |
|-------|--------|
| `Straße` | `Strasse` |
| `Größe` | `Groesse` |
| `weiß` | `weiss` |

## edit_distance_metric

The `edit_distance_metric` function calculates a combined score using Word Error Rate (WER) and Character Error Rate (CER). It's designed for use with DSPy's optimization features.

### How It Works

```
Score = 1 - ((WER + CER) / 2)
```

The score is inverted because DSPy **maximizes** metrics during optimization.

| Score | Meaning |
|-------|---------|
| `1.0` | Perfect match |
| `0.5` | 50% average error rate |
| `0.0` | Completely different |

### Usage

```python
from backend_common.dspy_common.metrics import edit_distance_metric
import dspy

# Use as a metric for DSPy optimization
optimizer = dspy.MIPROv2(
    metric=lambda gold, pred, trace: edit_distance_metric(
        gold, pred, key="translated_text", trace=trace
    ),
    # ... other optimizer config
)
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `gold` | `dspy.Example` | The gold standard example |
| `pred` | `dspy.Prediction` | The predicted output |
| `key` | `str` | The field name to compare |
| `trace` | `str \| None` | Optional trace information |

### Example

```python
from backend_common.dspy_common.metrics import edit_distance_metric
import dspy

gold = dspy.Example(translated_text="Hello everyone!")
pred = dspy.Prediction(translated_text="Hello everyone")

score = edit_distance_metric(gold, pred, key="translated_text")
print(f"Score: {score}")  # Close to 1.0 (very similar)
```

## Complete Example

Here's a complete example showing all components working together:

```python
import dspy
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from backend_common.config import AppConfig
from backend_common.logger import init_logger, get_logger
from backend_common.dspy_common.module import AbstractDspyModule
from backend_common.dspy_common.stream_listener import SwissGermanStreamListener
from backend_common.dspy_common.metrics import edit_distance_metric


# Define your signature
class SummarizationSignature(dspy.Signature):
    """Summarize text in the target language."""
    
    text = dspy.InputField(desc="Text to summarize")
    target_language = dspy.InputField(desc="Language for the summary")
    summary = dspy.OutputField(desc="Summarized text")


# Implement your module
class SummarizationModule(AbstractDspyModule):
    def __init__(self):
        super().__init__()
        self.predict = dspy.Predict(SummarizationSignature)
        
        stream_listener = SwissGermanStreamListener(
            signature_field_name="summary",
            allow_reuse=True
        )
        self.stream_predict = dspy.streamify(
            self.predict,
            stream_listeners=[stream_listener]
        )

    def predict_with_context(self, **kwargs: object) -> dspy.Prediction:
        return self.predict(**kwargs)

    async def stream_with_context(self, **kwargs: object) -> AsyncIterator:
        async for chunk in self.stream_predict(**kwargs):
            yield chunk


# FastAPI integration
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_logger()
    
    # Configure DSPy with your LLM
    config = AppConfig.from_env()
    lm = dspy.LM(config.llm_model, api_key=config.openai_api_key)
    dspy.configure(lm=lm)
    
    logger = get_logger(__name__)
    logger.info("DSPy configured", model=config.llm_model)
    yield


app = FastAPI(lifespan=lifespan)
module = SummarizationModule()


@app.post("/summarize")
async def summarize(text: str, language: str = "de"):
    result = module.forward(
        text=text,
        target_language=language,
        reasoning=False
    )
    return {"summary": result.summary}


@app.post("/summarize/stream")
async def summarize_stream(text: str, language: str = "de"):
    from fastapi.responses import StreamingResponse
    
    async def generate():
        async for chunk in module.stream(
            text=text,
            target_language=language
        ):
            yield chunk
    
    return StreamingResponse(generate(), media_type="text/plain")
```

::: tip Source Code
The full implementation is available on GitHub: [backend_common/dspy_common](https://github.com/DCC-BS/backend-common/tree/main/src/backend_common/dspy_common)
:::
