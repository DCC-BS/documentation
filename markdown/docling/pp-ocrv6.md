# Docling PP-OCRv6 Plugin

A Docling OCR plugin that provides local, high-performance text recognition using PaddlePaddle's **PP-OCRv6** models.

**GitHub Repository:** [DCC-BS/docling-pp-ocrv6](https://github.com/DCC-BS/docling-pp-ocrv6)

## Features
- **Local Execution:** Runs PP-OCRv6 detection and recognition ONNX checkpoints locally via [RapidOCR](https://github.com/RapidAI/RapidOCR) (onnxruntime) inside the Docling worker.
- **GPU Acceleration:** Automatically leverages CUDA when the accelerator device resolves to CUDA and `onnxruntime-gpu` is installed.
- **On-Demand Downloads:** Automatically downloads and caches detection and recognition models from Hugging Face on first use.
- **Integration with docling-serve:** Supports serving via `docling-serve` using the `"pp-ocrv6"` engine key.

## Installation
Pick exactly one `onnxruntime` variant to prevent registration conflicts:

- **Using uv (CPU):** `uv add "docling-pp-ocrv6[cpu]"`
- **Using uv (GPU):** `uv add "docling-pp-ocrv6[gpu]"`
- **Using pip (CPU):** `pip install "docling-pp-ocrv6[cpu]"`
- **Using pip (GPU):** `pip install "docling-pp-ocrv6[gpu]"`

## Usage

### Document Converter
Integrate into the Docling Python SDK by configuring `PdfPipelineOptions`:

```python
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling_pp_ocrv6 import PPOCRv6Options

pipeline_options = PdfPipelineOptions(do_ocr=True)
pipeline_options.ocr_options = PPOCRv6Options()

converter = DocumentConverter(
    format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)}
)
result = converter.convert("scanned.pdf")
```

### Docling Serve
When running with `docling-serve`, request the engine by setting the `ocr_engine` to `"pp-ocrv6"` in your options:

```json
{
  "options": {
    "ocr": true,
    "ocr_engine": "pp-ocrv6"
  }
}
```

*Note: Ensure `DOCLING_SERVE_ALLOW_EXTERNAL_PLUGINS=true` is set in the environment for external plugins to load.*
