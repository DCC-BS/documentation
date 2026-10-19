# Hosted Models & AI APIs

The **KDKP** hosts a range of open-source models behind standardized, OpenAI-compatible APIs so that cantonal departments can integrate them in a consistent way.

---

## Getting Started

All KDKP Large Language Models, embeddings, and rerankers are exposed via OpenAI-compatible endpoints. We provide templates, credential setup, and notes on cantonal network truststore integration to help developers connect.

> [!TIP]
> **API Starter Code Repository**
> Client libraries, connection scripts, and usage examples for Python and other runtimes are available in the public **[DCC-BS kdkp-api-starter-code](https://github.com/DCC-BS/kdkp-api-starter-code)** repository.

---

## How We Select Models

Every candidate model must pass five hard gates (GPU fit, one server, vLLM, licence, Hugging Face), then we test it on our own data, in our apps and under load. Leaderboards such as [Artificial Analysis](https://artificialanalysis.ai/) are inputs, not the decision.

The full method is described in [AI Model Evaluation](/evaluation/selection-standard).

---

## Model Status

Each model below is marked with a status:

* 🟢 **Active** — in production use.
* 🟡 **Deactivated** — temporarily turned off, may return.
* ⚪ **Retired** — no longer hosted.

---

## Model Catalog

Models are grouped by function: Large Language Models (LLM), text embeddings and rerankers, audio processing, Optical Character Recognition (OCR), and document parsing.

### 1. Large Language Models (LLM)

#### Gemma 4 31B — 🟢 Active
General-purpose LLM from Google. Supports reasoning, tool-use, and vision (image/video) input.
* **Hugging Face Model**: [RedHatAI/gemma-4-31B-it-NVFP4](https://huggingface.co/RedHatAI/gemma-4-31B-it-NVFP4)
* **Applications**: TextMate, BS-Übersetzer, RAG Bot, Berichtgenerator.

#### Qwen 3 32B — 🟡 Deactivated
Reasoning LLM from Alibaba with a large context window and strong multilingual support. Scheduled for retirement in favor of Gemma 4.
* **Hugging Face Model**: [Qwen/Qwen3-32B-AWQ](https://huggingface.co/Qwen/Qwen3-32B-AWQ)
* **Applications**: TextMate, BS-Übersetzer, Berichtgenerator, RAG Bot, Berichtgenerator.

#### Qwen 3.5 27B — 🟡 Deactivated
Multimodal reasoning model from Alibaba. Temporarily deactivated due to high token generation overhead during reasoning tasks.
* **Hugging Face Model**: [Qwen/Qwen3.5-27B-FP8](https://huggingface.co/Qwen/Qwen3.5-27B-FP8)
* **Applications**: Under evaluation.

#### Gemma 3 27B — ⚪ Retired
Vision-language model from Google. Previously used for experimental visual tasks.
* **Hugging Face Model**: [ISTA-DASLab/gemma-3-27b-it-GPTQ-4b-128g](https://huggingface.co/ISTA-DASLab/gemma-3-27b-it-GPTQ-4b-128g)

#### Llama 3.3 70B — ⚪ Retired
Generative text model from Meta AI.
* **Hugging Face Model**: [cortecs/Llama-3.3-70B-Instruct-FP8-Dynamic](https://huggingface.co/cortecs/Llama-3.3-70B-Instruct-FP8-Dynamic)

---

### 2. Embeddings & Rerankers

Embeddings and rerankers power the retrieval pipelines behind semantic search and RAG assistants.

#### Qwen 3 0.6B Embedding — 🟢 Active
Lightweight text embedding model that turns documents and queries into dense vectors.
* **Hugging Face Model**: [Qwen/Qwen3-Embedding-0.6B-GGUF](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B-GGUF)
* **Applications**: RAG Bot.

#### Qwen 3 0.6B Reranker — 🟢 Active
Lightweight cross-encoder that re-scores and re-orders search results.
* **Hugging Face Model**: [Qwen/Qwen3-Reranker-0.6B](https://huggingface.co/Qwen/Qwen3-Reranker-0.6B)
* **Applications**: RAG Bot.

---

### 3. Audio Processing (Speech-to-Text)

#### FasterWhisper — 🟢 Active
Speech-to-text runtime for transcription and speaker indexing.
* **Description**: OpenAI's Whisper model optimized with CTranslate2, combined with PyAnnote diarization for speaker indexing.
* **Hugging Face Model**: [openai/whisper-large-v2](https://huggingface.co/openai/whisper-large-v2) (Transcription) and [pyannote/speaker-diarization-community-1](https://huggingface.co/pyannote/speaker-diarization-community-1) (Speaker Diarization)
* **Applications**: Transcribo, Kantonspolizei Berichtgenerator, DCC Berichtgenerator.

---

### 4. Optical Character Recognition (OCR)

#### GLM-OCR — 🟢 Active
OCR engine for multi-lingual document layouts; extracts text from scanned images and forms.
* **Hugging Face Model**: [zai-org/GLM-OCR](https://huggingface.co/zai-org/GLM-OCR)
* **Applications**: RPA (Robotic Process Automation) workloads in the GD department, StatA survey questionnaires.

#### Dots.ocr — ⚪ Retired
Alternative OCR engine.
* **Hugging Face Model**: [rednote-hilab/dots.ocr](https://huggingface.co/rednote-hilab/dots.ocr)

---

### 5. Document Processing

#### Docling — 🟢 Active
Layout-aware parser that converts PDF, DOCX, and PPTX files into Markdown or JSON.
* **Official Documentation**: [Docling Core](https://www.docling.ai/)
* **Applications**: TextMate, BS-Übersetzer, OGD GR Geschäfte.
