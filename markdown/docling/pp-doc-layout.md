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

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `PP_DOC_LAYOUT_MODEL_NAME` | HuggingFace repo or local path of the model | `PaddlePaddle/PP-DocLayoutV3_safetensors` |
| `PP_DOC_LAYOUT_CONFIDENCE_THRESHOLD` | Minimum detection confidence | `0.3` |
| `PP_DOC_LAYOUT_BATCH_SIZE` | Pages per inference batch | `8` |
| `PP_DOC_LAYOUT_LIST_DETECTION` | `rules`, `heron` or `off` | `rules` |
| `PP_DOC_LAYOUT_CREATE_ORPHAN_CLUSTERS` | Create clusters for orphaned elements | `true` |
| `PP_DOC_LAYOUT_KEEP_EMPTY_CLUSTERS` | Keep empty clusters | `false` |
| `PP_DOC_LAYOUT_SKIP_CELL_ASSIGNMENT` | Skip table-cell assignment | `false` |
