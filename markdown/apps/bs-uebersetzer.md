---
outline: deep
editLink: true
---

# BS-Übersetzer

BS-Übersetzer is an AI translation tool for cantonal staff, supporting text, documents, and spoken input across 50+ languages.

## What it does

- **Intelligent Translation** AI-powered translation between 50+ languages with automatic source-language detection
- **Tone & Style Control** formal, informal, technical, creative, or concise tone
- **Domain-Specific Translation** specialized handling for legal, medical, technical, financial, and other domains
- **File Conversion** translate whole documents (PDF, DOCX, PPTX, XLSX, HTML, Markdown, AsciiDoc, CSV, TXT and images, up to 50 MB)
- **Photo Translation** take or upload a photo; the text is recognized with GLM-OCR and each block is translated in place on the photo, including table cells. Changing the target language re-translates without running OCR again
- **Custom Glossary** personal terminology list for consistent translations
- **Voice Input** dictate source text via speech-to-text
- **Document Export** download translations as Word documents
- **Conversation Mode** Google Translate-style chat interface for back-and-forth translation of short text snippets
- **No lost work** reloading or leaving the page while a recording, transcription or translation runs asks for confirmation first

Available in German and English.

## Interfaces & Integration

| What | Description |
|---|---|
| **Authentication** | No authentication currently enabled; the app supports Azure AD (Entra ID) SSO but currently runs in no-auth mode |
| **Progressive Web App** | Full PWA; installable with offline support |
| **Microsoft Teams** | Not integrated |
| **IT BS Unternehmensportal App Store** | Available |
| **KDKP APIs used** | LLM inference (vLLM, Gemma4-31B), Docling (document conversion; photo OCR with GLM-OCR and PP-DocLayout-V3), speech-to-text (FasterWhisper / BentoML) |

## Source Code

- Frontend: [github.com/DCC-BS/bs-translator-frontend](https://github.com/DCC-BS/bs-translator-frontend)
- Backend: [github.com/DCC-BS/bs-translator-backend](https://github.com/DCC-BS/bs-translator-backend)

## Architecture Overview

```mermaid
graph LR
    User([Cantonal User]) --> FE[Nuxt Frontend<br/>BS-Übersetzer]
    FE -. optional, currently disabled .-> AAD[Azure AD / Entra ID]
    FE -- feedback submission --> GH[GitHub API<br/>Feedback Issues]
    FE -- REST --> BE[FastAPI Backend]
    BE -- via Tyk API Gateway --> TYK[Tyk API Gateway]

    subgraph KDKP["Kantonale Daten- und KI-Plattform (KDKP)"]
        TYK --> LLM[vLLM<br/>Gemma4-31B]
        TYK --> DOC[Docling<br/>Document Conversion]
        DOC --> GLM[vLLM<br/>GLM-OCR]
        TYK --> WHISPER[FasterWhisper / BentoML<br/>Speech-to-Text]
    end

    classDef app fill:#f3e8ff,stroke:#6b21a8,stroke-width:1px;
    classDef ext fill:#dbeafe,stroke:#1e40af,stroke-width:1px;
    class FE,BE app;
    class AAD,GH ext;
```

## Photo translation

```mermaid
sequenceDiagram
    participant UI as Photo page
    participant BE as Backend
    participant DOC as Docling (GLM-OCR)
    participant LLM as vLLM
    UI->>BE: POST /translation/image/ocr (photo)
    BE->>DOC: convert, ocr_preset=glm-ocr-remote, layout_preset=ppdoclayout-v3
    DOC-->>BE: text blocks + table cells with boxes
    BE-->>UI: blocks, boxes normalized to the image (0..1)
    UI->>BE: POST /translation/image/blocks (blocks, target language)
    BE->>LLM: one translation per block, whole page as context
    BE-->>UI: NDJSON, one line per translated block, then done
```

The OCR result stays in the browser: changing the language only repeats the
second request. Each layout region is its own GLM-OCR crop (no `force_ocr`), so
every block keeps its position. The backend settings are
`DOCLING_IMAGE_OCR_PRESET` (default `glm-ocr-remote`),
`DOCLING_IMAGE_LAYOUT_PRESET` (default `ppdoclayout-v3`) and
`IMAGE_TRANSLATION_CONCURRENCY` (default 4); docling-serve needs the
[GLM-OCR plugin](../docling/glm-ocr) and a reachable vLLM serving `zai-org/GLM-OCR`.
