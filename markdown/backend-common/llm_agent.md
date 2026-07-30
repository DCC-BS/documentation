---
outline: deep
editLink: true
skillParent: dcc-backend
skillName: backend-llm-agent
skillDescription: "dcc_backend_common.llm_agent module: a Pydantic AI agent framework (pydantic_ai extra). Use when subclassing BaseAgent, streaming with run/run_stream_text/run_stream_events/stream_list, configuring LlmConfig (timeout, retries, thinking mode), adding postprocessors (trim_text, replace_eszett), or debugging via withDebbugger."
---
# LLM Agent Module

The `dcc_backend_common.llm_agent` module provides a comprehensive Pydantic AI agent framework with streaming support, postprocessing utilities, and debugging tools.

## Overview

The module provides:

- **`BaseAgent`**: Abstract base class for creating reusable LLM agents with streaming and postprocessing
- **`LlmConfig`**: Base configuration class for LLM API settings (model, URL, key, timeout, retries)
- **Automatic retries**: A tenacity-backed httpx transport that retries transient vLLM/network errors and honours `Retry-After`
- **Thinking mode**: Opt-in reasoning support for models that expose it
- **Usage logging**: Every call emits an `llm_call` event on the always-on `usage` logger
- **Debugging utilities**: Event stream handlers and decorators for detailed agent logging
- **Postprocessing utilities**: Automatic text normalization and custom postprocessing pipelines
- **Streaming modes**: Multiple options for streaming responses (text, lists, structured output, events)

## Installation

The LLM agent module requires the optional `pydantic_ai` extras:

```bash
uv add "dcc-backend-common[pydantic_ai]"
```

Or with uv sync:

```bash
uv sync --group dev --all-extras
```

## Quick Start

Here's a complete example of creating a simple translation agent:

```python
from pydantic_ai import Agent, RunContext
from pydantic_ai.models import Model
from dcc_backend_common.llm_agent import BaseAgent
from dcc_backend_common.config import get_env_or_throw
from dcc_backend_common.config.app_config import LlmConfig
from typing import override


# Configuration
class TranslationConfig(LlmConfig):
    @classmethod
    @override
    def from_env(cls) -> "TranslationConfig":
        return cls(
            llm_model=get_env_or_throw("LLM_MODEL"),
            llm_url=get_env_or_throw("LLM_URL"),
            llm_api_key=get_env_or_throw("LLM_API_KEY"),
        )
    
    @override
    def __str__(self) -> str:
        return f"TranslationConfig(llm_model={self.llm_model}, llm_api_key=****)"


# Agent
class TranslationAgent(BaseAgent[None, str]):
    def __init__(self, config: LlmConfig):
        super().__init__(config, deps_type=None, output_type=str)

    @override
    def create_agent(self, model: Model) -> Agent[None, str]:
        agent = Agent(model=model, deps_type=None, output_type=str)

        @agent.instructions
        def get_instruction(ctx: RunContext[None]):
            return "You are a helpful translator. Translate the given text to English."
        
        return agent


# Usage
config = TranslationConfig.from_env()
agent = TranslationAgent(config)

# Synchronous execution
result = await agent.run("Hallo Welt")
print(result)  # "Hello World"

# Streaming text
async for chunk in agent.run_stream_text("Hallo Welt"):
    print(chunk, end="")
```

## Configuration - LlmConfig

The `LlmConfig` class is a base configuration class specifically for LLM-related settings. It extends `AbstractAppConfig` but does not implement `from_env()` or `__str__()` by default.

::: warning Import path
`LlmConfig` lives in `dcc_backend_common.config.app_config` and is **not** re-exported from `dcc_backend_common.config`:

```python
from dcc_backend_common.config.app_config import LlmConfig
```
:::

### Available Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `llm_model` | `str` | Required | The model identifier (e.g., `"gemma-3-27b-it"`) |
| `llm_url` | `str` | Required | The URL for the LLM API endpoint |
| `llm_api_key` | `str` | Required | The API key for authentication |
| `llm_timeout` | `int` | `300` | Request timeout in seconds. Applied to both the httpx client and the model settings |
| `llm_max_retries` | `int` | `2` | Retries for transient failures — `N` retries means `N + 1` total attempts |

### Creating a Custom Config

Create a subclass of `LlmConfig` and implement `from_env()` and `__str__()`:

```python
from dcc_backend_common.config import get_env_or_throw
from dcc_backend_common.config.app_config import LlmConfig
from typing import override


class MyLlmConfig(LlmConfig):
    @classmethod
    @override
    def from_env(cls) -> "MyLlmConfig":
        return cls(
            llm_model=get_env_or_throw("LLM_MODEL"),
            llm_url=get_env_or_throw("LLM_URL"),
            llm_api_key=get_env_or_throw("LLM_API_KEY"),
        )
    
    @override
    def __str__(self) -> str:
        return f"MyLlmConfig(llm_model={self.llm_model}, llm_api_key=****)"


# Load configuration
config = MyLlmConfig.from_env()
print(config)  # MyLlmConfig(llm_model=gpt-4o, llm_api_key=****)
```

## Creating Custom Agents - BaseAgent

### BaseAgent Class

The `BaseAgent` class is an abstract base class for creating LLM agents. It's a generic class with two type parameters:

```python
class BaseAgent[DepsType, OutputType](ABC):
    ...
```

**Type Parameters:**
- `DepsType`: Type for dependency injection passed to the agent (use `None` if not needed)
- `OutputType`: Expected output type (`str`, Pydantic model, TypedDict, etc.)

### Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config` | `LlmConfig` | Required | LLM API configuration |
| `deps_type` | `type[DepsType] \| None` | `None` → `NoneType` | Type for dependencies |
| `output_type` | `type[OutputType] \| None` | `None` → `str` | Expected output type |
| `enable_thinking` | `bool` | `False` | Enable thinking / reasoning mode |

The constructor builds the `OpenAIProvider`, the `OpenAIChatModel` and the retrying HTTP client, then calls your `create_agent()`. It is configured for self-hosted vLLM-style endpoints via an `OpenAIModelProfile` with multiple system messages and strict tool definitions disabled, and JSON-schema output enabled.

### Abstract Method

You must implement the `create_agent()` method:

```python
@override
def create_agent(self, model: Model) -> Agent[DepsType, OutputType]:
    """Create the pydantic-ai Agent instance."""
    ...
```

### Example: Agent with Pydantic Output

```python
from pydantic import BaseModel


class SummaryResult(BaseModel):
    summary: str
    word_count: int


class SummaryAgent(BaseAgent[None, SummaryResult]):
    def __init__(self, config: LlmConfig):
        super().__init__(config, deps_type=None, output_type=SummaryResult)

    @override
    def create_agent(self, model: Model) -> Agent[None, SummaryResult]:
        return Agent(model=model, deps_type=None, output_type=SummaryResult)
```

## Retries and Timeouts

`BaseAgent` builds its own `httpx.AsyncClient` with a tenacity retry transport, so transient vLLM/network failures do not surface to your code:

| Aspect | Behaviour |
|--------|-----------|
| Retried on | `httpx.TransportError` (connection/transport) and `httpx.HTTPStatusError` (any non-2xx, including 429) |
| Attempts | `config.llm_max_retries + 1` (default 2 retries = 3 attempts) |
| Backoff | Honours the `Retry-After` header; otherwise exponential backoff (multiplier 1, max 60s), capped at 300s per wait |
| Timeout | `config.llm_timeout` on both the httpx client and the model settings |
| On exhaustion | The last exception is re-raised (`reraise=True`) |

Tune it through the config rather than the agent:

```python
config = MyLlmConfig(
    llm_model="gemma-3-27b-it",
    llm_url="http://vllm:8000/v1",
    llm_api_key="...",
    llm_timeout=600,      # long documents
    llm_max_retries=4,
)
```

## Thinking Mode

Pass `enable_thinking=True` to turn on reasoning for models that support it:

```python
class ReasoningAgent(BaseAgent[None, str]):
    def __init__(self, config: LlmConfig):
        super().__init__(config, output_type=str, enable_thinking=True)
```

This does three things:

- Sends `extra_body={"chat_template_kwargs": {"enable_thinking": True}}` with every request
- Sets `openai_reasoning_effort` to `"medium"`
- Sets `thinking_always_enabled` on the model profile

With `enable_thinking=False` (the default) the same `chat_template_kwargs` flag is sent as `False`, which explicitly disables thinking on models that would otherwise default to it.

::: tip Observing thinking
Thinking tokens arrive as `ThinkingPartDelta` events on `run_stream_events()`; `run_stream_text()` only yields regular text parts. See [Debugging](#debugging) to log them.
:::

## Per-Call Model Settings

Any `model_settings` you pass to `run()` or a streaming method is **deep-merged** with the agent's instance-level settings, so `extra_body.chat_template_kwargs` (and therefore the thinking flag) is never silently dropped:

```python
result = await agent.run(
    "Summarise this",
    model_settings={"temperature": 0.2},
)
```

Your keys win on conflict; keys you do not set keep the instance value.

## Prompt Preprocessing

Override `process_prompt()` to transform the prompt before it reaches the model. It runs for every execution mode:

```python
class ContextAgent(BaseAgent[MyDeps, str]):
    @override
    def process_prompt(self, prompt: UserPrompt, deps: MyDeps | None) -> UserPrompt:
        if deps is None or not isinstance(prompt, str):
            return prompt
        return f"Document language: {deps.language}\n\n{prompt}"
```

## Usage Logging

Every completed run logs an `llm_call` event through the pinned `usage` logger, so it is emitted regardless of `LOG_LEVEL` (see [Logger](/backend-common/logger#usage-events)):

| Field | Description |
|-------|-------------|
| `input_tokens` | Prompt tokens |
| `output_tokens` | Completion tokens |
| `total_tokens` | Sum reported by the provider |
| `tool_calls` | Number of tool calls in the run |
| `requests` | Number of HTTP requests the run needed |
| `usage_details` | Provider-specific usage breakdown |
| `finish_reason` | Why the model stopped |

::: warning Not every mode logs
`run()`, `stream_list()` and `run_stream_output()` log on completion. `run_stream_events()` — and therefore `run_stream_text()`, which is built on it — does not emit `llm_call`; the usage data is available on the `AgentRunResultEvent` you receive at the end of the event stream.
:::

## Streaming Modes

### Simple Execution - `run()`

Executes the agent and returns the complete output after processing.

```python
result: OutputType = await agent.run(user_prompt="Hello, world!")
```

**Features:**
- Returns complete structured output
- Applies postprocessing to the final result
- Logs LLM usage statistics (tokens, tool calls, etc.)

### Streaming Text - `run_stream_text()`

Streams text output chunk by chunk, ideal for real-time responses.

```python
async for chunk in agent.run_stream_text(user_prompt="Hello, world!"):
    print(chunk, end="")
```

**Parameters:**
- `user_prompt`: The input prompt (default: `None`)
- `deps`: Dependencies for the agent (default: `None`)
- `delta`: `True` (default) yields only the new piece of text per chunk; `False` yields the accumulated text so far on every chunk
- `**kwargs`: Additional keyword arguments passed to the agent

```python
# delta=True (default) -> "Hello", " ", "World"
async for chunk in agent.run_stream_text("Hallo Welt"):
    print(chunk, end="")

# delta=False -> "Hello", "Hello ", "Hello World"
async for text in agent.run_stream_text("Hallo Welt", delta=False):
    render(text)
```

**Features:**
- Emits both the first piece of a text part (from `PartStartEvent`) and every subsequent `PartDeltaEvent`, so no leading text is lost
- Applies the **stream** postprocessors to each chunk (see [Postprocessing](#postprocessing)) — notably `trim_text` is excluded, since trimming each chunk would eat legitimate whitespace
- Useful for chat interfaces and real-time feedback

### Streaming List Items - `stream_list()`

Streams the items of a list output progressively. Each emission is the latest state of the **last** item, so callers see one item being built up, then a new emission as the next item starts.

```python
async for item in agent.stream_list("List 5 animals"):
    render(item)  # partially built item, then the next one, ...
```

Internally the agent overrides the run's output type with a `{"list": [...]}` container, so the agent's own `output_type` is not used for this call — the item shape comes from what the model produces under your instructions. Each emission is postprocessed with the full (non-streaming) postprocessor pipeline, and `llm_call` usage is logged when the stream ends.

### Streaming Structured Output - `run_stream_output()`

Streams raw structured output chunks as pydantic-ai validates them — useful when the output type is a model and you want to render fields as they fill in.

```python
async for partial in agent.run_stream_output("Summarise this document"):
    render(partial)  # progressively more complete SummaryResult
```

Each chunk goes through the full postprocessor pipeline.

### Streaming Raw Events - `run_stream_events()`

Yields the raw pydantic-ai event stream (`AgentStreamEvent`, ending with an `AgentRunResultEvent`). **No postprocessing is applied.** Use it when you need tool calls, thinking deltas, or part boundaries:

```python
from pydantic_ai import PartStartEvent, FunctionToolCallEvent

async for event in agent.run_stream_events("Hello"):
    if isinstance(event, FunctionToolCallEvent):
        log_tool(event.part.tool_name)
```

## Debugging

### `withDebbugger` Wrapper

Use `withDebbugger` to inject an event stream debugger into any async function or async generator function that runs an agent:

```python
from dcc_backend_common.llm_agent.debugging.agent_debugger import withDebbugger

agent = TranslationAgent(config)

# without debugger
result = await agent.run("Hallo Welt")

# with debugger
result = await withDebbugger(agent.run, name="TranslationAgent")("Hallo Welt")

# also works on the streaming methods (async generators)
async for chunk in withDebbugger(agent.run_stream_text, name="TranslationAgent")("Hallo Welt"):
    print(chunk, end="")
```

::: warning Name and import path
The function is spelled `withDebbugger` (double `b`), and `debugging/__init__.py` is empty — import from `dcc_backend_common.llm_agent.debugging.agent_debugger`, not from the `debugging` package.
:::

**Parameters:**
- `fn`: An async function or async generator function. Anything else raises `TypeError`
- `name` (`str | None`): Label attached to every logged event (default: `"UnnamedAgent"`)

The wrapper injects `event_stream_handler` into the call's kwargs — but only if the caller did not already pass one, so an explicit handler always wins. All events are logged at `DEBUG` level, so set `LOG_LEVEL=DEBUG` to see them.

### What Gets Logged

The debugger logs the following event types:

| Event Type | Description |
|------------|-------------|
| `PartStartEvent` | When a response part starts |
| `PartDeltaEvent` | Text, thinking, and tool call deltas |
| `FunctionToolCallEvent` | When LLM calls a tool |
| `FunctionToolResultEvent` | When a tool returns results |
| `FinalResultEvent` | When final result production starts |
| `PartEndEvent` | When a response part ends |

### Using `create_event_debugger()`

Build the event stream handler yourself and hand it to any agent call:

```python
from dcc_backend_common.llm_agent.debugging.event_debugger import create_event_debugger

event_handler = create_event_debugger(name="MyAgent")

result = await agent.run("Hello", event_stream_handler=event_handler)
```

It returns a pydantic-ai `EventStreamHandler`: an async callable taking `(ctx, event_stream)` that consumes the stream and logs each event.

## Postprocessing

Postprocessing automatically transforms agent outputs after the LLM generates them but before they're returned.

### Built-in Postprocessors

Two postprocessors are included by default:

| Function | Applied to | Description |
|----------|------------|-------------|
| `replace_eszett()` | All outputs | Recursively replaces German ß with "ss" in every string — including inside Pydantic models, mappings, and lists |
| `trim_text()` | Only when `output_type` is `str` | Strips leading whitespace. Raises `TypeError` on non-string input |

### Two Pipelines

There are two cached pipelines, built once in the constructor:

| Pipeline | Built by | Used by |
|----------|----------|---------|
| Postprocessors | `_get_postprocessors()` | `run()`, `stream_list()`, `run_stream_output()` |
| Stream postprocessors | `_get_stream_postprocessors()` | `run_stream_text()`, applied per chunk |

By default the stream pipeline is the full pipeline **minus** `trim_text` — trimming every chunk would swallow legitimate whitespace mid-stream. Override `_get_stream_postprocessors()` to change that:

```python
@override
def _get_stream_postprocessors(self) -> list[Preprocessor]:
    return [*super()._get_stream_postprocessors(), my_chunk_processor]
```

::: warning Cached at construction
Both pipelines are computed in `__init__`. Mutating the returned lists later has no effect — override the methods instead.
:::

### Adding Custom Postprocessors

Override the `_get_postprocessors()` method to add custom postprocessing logic:

```python
from dcc_backend_common.llm_agent import BaseAgent, Preprocessor
from dcc_backend_common.llm_agent.postprocessing import PostprocessingContext


class MyAgent(BaseAgent[None, str]):
    def __init__(self, config: LlmConfig):
        super().__init__(config, deps_type=None, output_type=str)

    @override
    def _get_postprocessors(self) -> list[Preprocessor]:
        postprocessors = super()._get_postprocessors()
        
        def to_uppercase(text: Any, context: PostprocessingContext) -> Any:
            if isinstance(text, str):
                return text.upper()
            return text
        
        postprocessors.append(to_uppercase)
        return postprocessors
```

### PostprocessingContext

Postprocessor functions receive a `PostprocessingContext` object with information about the current processing state:

| Field | Type | Description |
|-------|------|-------------|
| `index` | `int` | The index of the item being processed (0, 1, 2, ...) |
| `is_partial` | `bool` | Whether this is a partial (streaming) result |

::: tip Current behaviour
All built-in call sites pass the sentinel context `PostprocessingContext(is_partial=False, index=0)`, including the per-chunk streaming path. Write postprocessors that behave correctly under that assumption; the fields exist for postprocessors that need the distinction once richer contexts are threaded through.
:::

## API Reference

### Main Classes

| Class | Location | Description |
|-------|----------|-------------|
| `BaseAgent` | [base_agent.py](https://github.com/DCC-BS/backend-common/blob/main/src/dcc_backend_common/llm_agent/base_agent.py) | Abstract base class for LLM agents |
| `LlmConfig` | [config/app_config.py](https://github.com/DCC-BS/backend-common/blob/main/src/dcc_backend_common/config/app_config.py) | LLM configuration base class |
| `PostprocessingContext` | [postprocessing.py](https://github.com/DCC-BS/backend-common/blob/main/src/dcc_backend_common/llm_agent/postprocessing.py) | Context for postprocessing functions |

### Public API Methods

| Method | Description | Return Type |
|--------|-------------|-------------|
| `run()` | Execute agent and return complete output | `OutputType` |
| `run_stream_text()` | Stream text output chunk by chunk | `AsyncGenerator[str, None]` |
| `stream_list()` | Stream list items progressively | `AsyncGenerator[T, None]` |
| `run_stream_output()` | Stream structured output with postprocessing | `AsyncGenerator[Any, None]` |
| `run_stream_events()` | Stream all events for detailed debugging | `AsyncGenerator[AgentStreamEvent \| AgentRunResultEvent]` |

### Overridable Hooks

| Method | Purpose |
|--------|---------|
| `create_agent(model)` | **Required.** Build the pydantic-ai `Agent` |
| `process_prompt(prompt, deps)` | Transform the prompt before it is sent |
| `_get_postprocessors()` | Customise the non-streaming postprocessing pipeline |
| `_get_stream_postprocessors()` | Customise the per-chunk streaming pipeline |

### Exported Names

`dcc_backend_common.llm_agent` re-exports only `BaseAgent`, `Preprocessor` and `UserPrompt`. Everything else comes from its defining module:

| Name | Import from |
|------|-------------|
| `LlmConfig` | `dcc_backend_common.config.app_config` |
| `PostprocessingContext`, `trim_text`, `replace_eszett` | `dcc_backend_common.llm_agent.postprocessing` |
| `withDebbugger` | `dcc_backend_common.llm_agent.debugging.agent_debugger` |
| `create_event_debugger` | `dcc_backend_common.llm_agent.debugging.event_debugger` |

### Debugging Utilities

| Function/Decorator | Location | Description |
|--------------------|----------|-------------|
| `withDebbugger` | [agent_debugger.py](https://github.com/DCC-BS/backend-common/blob/main/src/dcc_backend_common/llm_agent/debugging/agent_debugger.py) | Wrap an async fn / async generator fn to inject an event debugger |
| `create_event_debugger()` | [event_debugger.py](https://github.com/DCC-BS/backend-common/blob/main/src/dcc_backend_common/llm_agent/debugging/event_debugger.py) | Create event stream handler |

### Postprocessing Functions

| Function | Location | Description |
|----------|----------|-------------|
| `trim_text()` | [postprocessing.py](https://github.com/DCC-BS/backend-common/blob/main/src/dcc_backend_common/llm_agent/postprocessing.py) | Remove blank lines from text start |
| `replace_eszett()` | [postprocessing.py](https://github.com/DCC-BS/backend-common/blob/main/src/dcc_backend_common/llm_agent/postprocessing.py) | Replace German ß with "ss" |

## Related Documentation

- [Configuration](/backend-common/config) - Manage application configuration
- [Logger](/backend-common/logger) - Structured logging with structlog
- [Python Coding Standards](/coding/python) - General Python best practices

## Source Code

::: tip Repository
Full implementation on GitHub: [github.com/DCC-BS/backend-common](https://github.com/DCC-BS/backend-common)
:::

Files:
- [llm_agent/base_agent.py](https://github.com/DCC-BS/backend-common/blob/main/src/dcc_backend_common/llm_agent/base_agent.py)
- [llm_agent/postprocessing.py](https://github.com/DCC-BS/backend-common/blob/main/src/dcc_backend_common/llm_agent/postprocessing.py)
- [llm_agent/debugging/agent_debugger.py](https://github.com/DCC-BS/backend-common/blob/main/src/dcc_backend_common/llm_agent/debugging/agent_debugger.py)
- [llm_agent/debugging/event_debugger.py](https://github.com/DCC-BS/backend-common/blob/main/src/dcc_backend_common/llm_agent/debugging/event_debugger.py)
- [config/app_config.py](https://github.com/DCC-BS/backend-common/blob/main/src/dcc_backend_common/config/app_config.py)
