# Docling GLM-OCR Plugin

A Docling OCR plugin that delegates text recognition to a remote GLM-OCR model served via vLLM.

**GitHub Repository:** [DCC-BS/docling-glm-ocr](https://github.com/DCC-BS/docling-glm-ocr)

## Features
- **Remote Delegation:** Offloads OCR processing to a remote vLLM server hosting [`zai-org/GLM-OCR`](https://huggingface.co/zai-org/GLM-OCR).
- **Markdown Output:** The model returns Markdown-formatted text, preserving headings, tables, and formulas.
- **Concurrent Processing:** Sends page crops as base64-encoded images via concurrent API requests with retry logic.
- **Skips Born-Digital Pages:** Pages with PDF text are not sent to the model as a whole; only regions that need OCR are.
- **Clean Output:** Discards repetition loops, caps tokens per crop by its size (`GLMOCR_REMOTE_OCR_MAX_TOKENS_PER_MEGAPIXEL`), strips code fences and echoed prompts, and turns HTML tables into plain text rows.
- **Engine Key:** Registers under the `"glm-ocr-remote"` engine key.

## Installation
- **Using uv (recommended):** `uv add docling-glm-ocr`
- **Using pip:** `pip install docling-glm-ocr`

## Usage
Configure the `DocumentConverter` with `GlmOcrRemoteOptions`:

```python
from docling_glm_ocr import GlmOcrRemoteOptions

pipeline_options.ocr_options = GlmOcrRemoteOptions(
    api_url="http://localhost:8001/v1/chat/completions",
    model_name="zai-org/GLM-OCR"
)
```

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `GLMOCR_REMOTE_OCR_API_URL` | vLLM chat completion URL | `http://localhost:8001/v1/chat/completions` |
| `GLMOCR_REMOTE_OCR_API_KEY` | Bearer token for the `Authorization` header | unset |
| `GLMOCR_REMOTE_OCR_MODEL_NAME` | Model name sent to vLLM | `zai-org/GLM-OCR` |
| `GLMOCR_REMOTE_OCR_PROMPT` | Prompt sent with each crop | Markdown OCR prompt |
| `GLMOCR_REMOTE_OCR_LANG` | Comma-separated language hints | `en` |
| `GLMOCR_REMOTE_OCR_TIMEOUT` | HTTP timeout per crop (s) | `120` |
| `GLMOCR_REMOTE_OCR_MAX_TOKENS` | Max tokens per completion | `16384` |
| `GLMOCR_REMOTE_OCR_MAX_TOKENS_PER_MEGAPIXEL` | Token budget per megapixel of a crop (`0` disables) | `2500` |
| `GLMOCR_REMOTE_OCR_SCALE` | Crop rendering scale | `3.0` |
| `GLMOCR_REMOTE_OCR_MAX_IMAGE_PIXELS` | Pixel budget per crop | `4500000` |
| `GLMOCR_REMOTE_OCR_MAX_CONCURRENT_REQUESTS` | Concurrent API requests | `10` |
| `GLMOCR_REMOTE_OCR_MAX_RETRIES` | Retries on HTTP errors | `3` |
| `GLMOCR_REMOTE_OCR_RETRY_BACKOFF_FACTOR` | Exponential backoff factor | `2.0` |
