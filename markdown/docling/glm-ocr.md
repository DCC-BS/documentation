# Docling GLM-OCR Plugin

A Docling OCR plugin that delegates text recognition to a remote GLM-OCR model served via vLLM.

**GitHub Repository:** [DCC-BS/docling-glm-ocr](https://github.com/DCC-BS/docling-glm-ocr)

## Features
- **Remote Delegation:** Offloads OCR processing to a remote vLLM server hosting [`zai-org/GLM-OCR`](https://huggingface.co/zai-org/GLM-OCR).
- **Markdown Output:** The model returns Markdown-formatted text, preserving headings, tables, and formulas.
- **Concurrent Processing:** Sends page crops as base64-encoded images via concurrent API requests with retry logic.
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