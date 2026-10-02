# DCC Docling Serve

A `docling-serve` image with the DCC docling plugins and a few patches for speed and operations.

**GitHub Repository:** [DCC-BS/dcc-docling-serve](https://github.com/DCC-BS/dcc-docling-serve)

## Features
- **Bundled Plugins:** [`docling-pp-doc-layout`](/docling/pp-doc-layout), [`docling-glm-ocr`](/docling/glm-ocr) and [`docling-pp-ocrv6`](/docling/pp-ocrv6), selectable per request. Plugin versions and model weights are pinned and baked into the image, so pods do not download anything at startup.
- **Web UI:** Upstream's UI at `/ui`, unchanged. The plugins show up among its OCR and layout choices.
- **Word Bounding Boxes:** `include_word_boxes=true` adds a `word_boxes` field to the answer: per page, every word and text line with its box and whether it came from OCR.
- **RapidOCR on the GPU:** CUDA images ship `onnxruntime-gpu`, so the default OCR engine runs on the GPU instead of the CPU.
- **Faster Born-Digital PDFs:** Vector shapes (table rules, underlines, background fills) no longer send regions with PDF text to OCR. On our test set (976 pages) conversion time drops from 522 s to 165 s with the same output. Disable with `DCC_OCR_IGNORE_SHAPES=0`.
- **Quiet Health Probes:** `GET /health` requests are not logged. Disable with `DCC_MUTE_HEALTH_LOGS=0`.
- **Multi-Environment Support:** Images for CPU (amd64, arm64), CUDA 12.8 and CUDA 13.0.
- **Full Stack:** Docker Compose setup with the Docling API and a vLLM server for GLM-OCR.

## Installation

1. **Prerequisites:** Docker with NVIDIA GPU support and a HuggingFace token.
2. **Configuration:** Copy `.env.example` to `.env` and set your `HF_TOKEN`.
3. **Start:** Run `make docker-up` to launch the services.

## Usage

- **API:** Send a POST request to `http://localhost:5001/v1/convert/source`. Select the plugins with `"ocr_engine": "glm-ocr-remote"` or `"pp-ocrv6"`, and `"layout_custom_config": { "kind": "ppdoclayout-v3" }`.
- **Word boxes:** Add `"include_word_boxes": true` (needs a `dlparse` PDF backend, the default). With PP-OCRv6 this also reads each page whole and returns a box per OCR'd word.
- **UI:** Open `http://localhost:5001/ui`.

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `DCC_WORD_BOXES` | `0` leaves the API as upstream has it (no `include_word_boxes`) | `1` |
| `DCC_OCR_IGNORE_SHAPES` | `0` restores docling's OCR rule for vector shapes | `1` |
| `DCC_MUTE_HEALTH_LOGS` | `0` logs health probes again | `1` |
| `DCC_MUTE_HEALTH_PATHS` | Comma-separated request paths muted in the access log | `/health` |

The plugins read their own variables, listed on their pages.

## Releases

Images are published to `ghcr.io/dcc-bs/dcc-docling-serve[-cpu|-cu128|-cu130]` when a version tag is pushed. The tag names the upstream docling-serve release: `v1.36.0` builds on upstream `v1.36.0`, and `v1.36.0-1` releases our own changes on the same upstream version.
