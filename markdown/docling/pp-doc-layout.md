# Docling PP-Doc-Layout Plugin

A Docling plugin that provides high-accuracy document layout detection using the [PaddlePaddle PP-DocLayoutV3](https://huggingface.co/PaddlePaddle/PP-DocLayoutV3) model.

**GitHub Repository:** [DCC-BS/docling-pp-doc-layout](https://github.com/DCC-BS/docling-pp-doc-layout)

## Features
- **High Accuracy:** Utilizes the RT-DETR instance segmentation framework.
- **Polygon Support:** Gracefully flattens complex polygon masks into Docling-compatible bounding boxes.
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