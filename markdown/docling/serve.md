# DCC Docling Serve

A `docling-serve` image with the DCC docling plugins and a few patches for speed and operations.

**GitHub Repository:** [DCC-BS/dcc-docling-serve](https://github.com/DCC-BS/dcc-docling-serve)

## Features
- **Bundled Plugins:** [`docling-pp-doc-layout`](/docling/pp-doc-layout), [`docling-glm-ocr`](/docling/glm-ocr) and [`docling-pp-ocrv6`](/docling/pp-ocrv6), selectable per request. Plugin versions and model weights are pinned and baked into the image, so pods do not download anything at startup.
- **Web UI:** Upstream's UI at `/ui`, unchanged. The plugins show up among its OCR and layout choices.
- **Word Bounding Boxes:** `include_word_boxes=true` adds a `word_boxes` field to the answer: per page, every word and text line with its box and whether it came from OCR.
- **Faster Tables:** TableFormer v1 from DCC's `docling-ibm-models` build (4.0.4 plus a KV-cache decoder and faster cell matching, same tables). The `docling-tableformer-batched` plugin runs the tables of a page batch in one call; select it with a table structure preset of kind `tableformer-v1-batched`.
- **Fewer Garbage Collections:** The PDF pipeline runs Python's garbage collector less often and freezes the loaded models, so a 600-page PDF no longer stalls for seconds while the collector walks the heap. Output is unchanged.
- **Word's Symbol and Wingdings Bullets:** PDFs exported from Word often carry private-use code points (U+F0B7, U+F0A7, …) instead of bullets. The image counts them as list markers, so the list item's text no longer starts with an invisible character.
- **Legacy Office Files:** `.doc`, `.rtf`, `.xls` and `.ppt` work: docling converts them with LibreOffice, which the image includes (the container needs a writable `/tmp`).
- **RapidOCR on the GPU:** CUDA images ship `onnxruntime-gpu`, so the default OCR engine runs on the GPU instead of the CPU.
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
| `DCC_LIST_BULLETS` | `0` leaves docling's list markers as upstream has them | `1` |
| `DCC_PIPELINE_GC` | `0` leaves the garbage collector as Python has it | `1` |
| `DCC_PIPELINE_GC_GEN0` | Generation-0 threshold of the garbage collector (Python's default is 700) | `20000` |
| `DCC_TABLES_MATCH`, `DCC_TABLES_DECODER`, `DCC_TABLES_PREP` | `0` turns off that TableFormer speed-up (same tables either way) | `1` |
| `DCC_TABLES_MAXB` | Tables the TableFormer decoder runs together | `4` |
| `DCC_MUTE_HEALTH_LOGS` | `0` logs health probes again | `1` |
| `DCC_MUTE_HEALTH_PATHS` | Comma-separated request paths muted in the access log | `/health` |

The plugins read their own variables, listed on their pages.

## Releases

Images are published to `ghcr.io/dcc-bs/dcc-docling-serve[-cpu|-cu128|-cu130]` by a manually dispatched workflow that takes a docling-serve release tag. Our image gets the same tag: `dcc-docling-serve:v1.39.0` is docling-serve v1.39.0 with our plugins and patches.

Since v1.37.0 the image no longer patches OCR for vector shapes: docling 2.136 fixed it upstream, so table rules, underlines and background fills no longer send regions with PDF text to OCR. `DCC_OCR_IGNORE_SHAPES` has no effect any more.

v1.39.0 comes with docling-parse 7.27, which renders scanned PDF pages a little differently for OCR: the OCR text of scans changes slightly, and notes on some plan drawings that were lost before are now read.
