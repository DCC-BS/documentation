# Docling PP-OCRv6 Plugin

A Docling OCR plugin that runs PaddlePaddle's PP-OCRv6 (medium) detection and recognition models locally through RapidOCR and onnxruntime. No external service is needed.

**GitHub Repository:** [DCC-BS/docling-pp-ocrv6](https://github.com/DCC-BS/docling-pp-ocrv6)

## Features
- **Local OCR:** Runs inside the docling worker, on the GPU when docling's accelerator is CUDA and `onnxruntime-gpu` is installed.
- **European Languages:** Defaults to a German-led European language set.
- **Word Boxes:** `return_word_box` adds each word OCR reads, with its box, to the page's word cells.
- **Whole-Page Reading:** `whole_page` reads each page as one picture instead of layout crops, so lines are not cut at layout boxes.
- **Engine Key:** Registers under the `"pp-ocrv6"` engine key.

## Installation
Pick exactly one onnxruntime extra:
- **CPU:** `pip install "docling-pp-ocrv6[cpu]"`
- **CUDA:** `pip install "docling-pp-ocrv6[gpu]"`

## Usage

```python
from docling_pp_ocrv6 import PPOCRv6Options

pipeline_options.ocr_options = PPOCRv6Options(return_word_box=True)
```

With docling-serve: `{ "options": { "do_ocr": true, "ocr_engine": "pp-ocrv6" } }`. Options can also be set with `PPOCRV6_*` environment variables (e.g. `PPOCRV6_LANG`, `PPOCRV6_WHOLE_PAGE`).
