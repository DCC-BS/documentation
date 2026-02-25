# DCC Docling Serve

A patched version of `docling-serve` that bundles DCC docling plugins for enhanced layout detection and OCR.

**GitHub Repository:** [DCC-BS/dcc-docling-serve](https://github.com/DCC-BS/dcc-docling-serve)

## Features
- **Bundled Plugins:** Includes `docling-pp-doc-layout` and `docling-glm-ocr`.
- **Multi-Environment Support:** Provides Docker images for CPU, CUDA 12.8, and CUDA 13.0.
- **Flexible Selection:** Engines are selectable per-request via the API or the included Gradio UI.
- **Full Stack:** Includes a Docker Compose setup to run both the Docling API and a vLLM server for OCR.

## Installation

1. **Prerequisites:** Docker with NVIDIA GPU support and a HuggingFace token.
2. **Configuration:** Copy `.env.example` to `.env` and set your `HF_TOKEN`.
3. **Start:** Run `make docker-up` to launch the services.

## Usage

- **API:** Send a POST request to `http://localhost:5001/v1/convert/source` specifying `"ocr_engine": "glm-ocr-remote"` and `"layout_custom_config": { "kind": "ppdoclayout-v3" }`.
- **UI:** Access the Gradio interface at `http://localhost:5001`.