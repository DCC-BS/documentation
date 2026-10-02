# Docling PP-Doc-Layout Plugin

A Docling plugin that provides high-accuracy document layout detection using the [PaddlePaddle PP-DocLayoutV3](https://huggingface.co/PaddlePaddle/PP-DocLayoutV3) model.

**GitHub Repository:** [DCC-BS/docling-pp-doc-layout](https://github.com/DCC-BS/docling-pp-doc-layout)

## Features
- **High Accuracy:** Utilizes the RT-DETR instance segmentation framework.
- **Polygon Support:** Gracefully flattens complex polygon masks into Docling-compatible bounding boxes.
- **List Detection:** The model has no list class, so the plugin detects list items from bullets and enumerator sequences after OCR (`PP_DOC_LAYOUT_LIST_DETECTION=rules`, default), optionally with docling's Heron model as a second opinion (`heron`).
- **Keeps Handwriting:** The default confidence threshold is 0.3 (`PP_DOC_LAYOUT_CONFIDENCE_THRESHOLD`), so handwriting and text in photos are kept.
- **Scalability:** Supports configurable batch sizing to optimize GPU VRAM usage and prevent OOM errors.
- **Auto-Registration:** Automatically registers itself as a layout engine upon installation.

## Installation
- **Using uv (recommended):** `uv add docling-pp-doc-layout`
- **Using pip:** `pip install docling-pp-doc-layout`

## Usage
Integrate into the Docling Python SDK by configuring `PdfPipelineOptions`:

```python
from docling_pp_doc_layout.options import PPDocLayoutV3Options

pipeline_options.layout_options = PPDocLayoutV3Options(batch_size=8)
```