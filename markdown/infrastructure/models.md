# Hosted Models & AI APIs

The **KDKP** hosts a range of open-source models behind standardized, OpenAI-compatible APIs so that cantonal departments can integrate them in a consistent way.

---

## Getting Started

All KDKP Large Language Models, embeddings, and rerankers are exposed via OpenAI-compatible endpoints. GLiNER is the exception, it has its own REST API. We provide templates, credential setup, and notes on cantonal network truststore integration to help developers connect.

> [!TIP]
> **API Starter Code Repository**
> Client libraries, connection scripts, and usage examples for Python and other runtimes are available in the public **[DCC-BS kdkp-api-starter-code](https://github.com/DCC-BS/kdkp-api-starter-code)** repository.

---

## How We Select Models

Every candidate model must pass five hard gates (GPU fit, one server, vLLM, licence, Hugging Face), then we test it on our own data, in our apps and under load. Leaderboards such as [Artificial Analysis](https://artificialanalysis.ai/) are inputs, not the decision.

The full method is described in [selection standard](/evaluation/selection-standard). [Test results](/evaluation/results) has the scores of the speech, OCR and document models, and lists the models we tested and didn't adopt.

---

## Model Status

Each model below is marked with a status:

* 🟢 **Active** — in production use.
* 🟡 **Deactivated** — temporarily turned off, may return.
* ⚪ **Retired** — no longer hosted.

---

## Model Catalog

Models are grouped by function: Large Language Models (LLM), text embeddings and rerankers, named entity recognition, audio processing, Optical Character Recognition (OCR), and document parsing.

### 1. Large Language Models (LLM)

#### Gemma 4 31B — 🟢 Active
General-purpose LLM from Google. Supports reasoning, tool-use, and vision (image/video) input.
* **Hugging Face Model**: [RedHatAI/gemma-4-31B-it-FP8-block](https://huggingface.co/RedHatAI/gemma-4-31B-it-FP8-block), with [google/gemma-4-31B-it-assistant](https://huggingface.co/google/gemma-4-31B-it-assistant) as draft model for speculative decoding
* **Applications**: Bebbi Bot, Bebbi Deep Research, TextMate, BS-Übersetzer, Transcribo, AnonyMate, Berichtgenerator.

#### Qwen 3.5 4B — 🟢 Active
Small model from Alibaba for background tasks. Bebbi Bot uses it as task model for chat titles, tags and follow-up questions, so these calls don't queue behind chats on Gemma 4. Thinking is off.
* **Hugging Face Model**: [RedHatAI/Qwen3.5-4B-FP8-dynamic](https://huggingface.co/RedHatAI/Qwen3.5-4B-FP8-dynamic)
* **Applications**: Bebbi Bot (task model).

#### Qwen 3.5 27B — ⚪ Retired
Multimodal reasoning model from Alibaba. Spent too many tokens on reasoning.
* **Hugging Face Model**: [Qwen/Qwen3.5-27B-FP8](https://huggingface.co/Qwen/Qwen3.5-27B-FP8)

#### Qwen 3 32B — ⚪ Retired
Reasoning LLM from Alibaba. Replaced by Gemma 4.
* **Hugging Face Model**: [Qwen/Qwen3-32B-AWQ](https://huggingface.co/Qwen/Qwen3-32B-AWQ)

#### Gemma 3 27B — ⚪ Retired
Vision-language model from Google. Previously used for experimental visual tasks.
* **Hugging Face Model**: [ISTA-DASLab/gemma-3-27b-it-GPTQ-4b-128g](https://huggingface.co/ISTA-DASLab/gemma-3-27b-it-GPTQ-4b-128g)

#### Llama 3.3 70B — ⚪ Retired
Generative text model from Meta AI.
* **Hugging Face Model**: [cortecs/Llama-3.3-70B-Instruct-FP8-Dynamic](https://huggingface.co/cortecs/Llama-3.3-70B-Instruct-FP8-Dynamic)

---

### 2. Embeddings & Rerankers

Embeddings and rerankers power the retrieval pipelines behind semantic search and RAG assistants.

#### Qwen 3 4B Embedding — 🟢 Active
Text embedding model that turns documents and queries into dense vectors. We serve our own FP8 quantization; the API name is `Qwen/Qwen3-Embedding-4B`.
* **Hugging Face Model**: [DCC-BS/Qwen3-Embedding-4B-FP8-Dynamic](https://huggingface.co/DCC-BS/Qwen3-Embedding-4B-FP8-Dynamic), based on [Qwen/Qwen3-Embedding-4B](https://huggingface.co/Qwen/Qwen3-Embedding-4B)
* **Applications**: Bebbi Bot (knowledge bases), Bebbi Deep Research.

#### Qwen 3 4B Reranker — 🟢 Active
Cross-encoder that re-scores and re-orders search results. We serve our own FP8 quantization; the API name is `Qwen/Qwen3-Reranker-4B`. vLLM runs it with the Qwen3 reranker prompt template, without it the scores barely separate relevant from unrelated passages.
* **Hugging Face Model**: [DCC-BS/Qwen3-Reranker-4B-FP8-Dynamic](https://huggingface.co/DCC-BS/Qwen3-Reranker-4B-FP8-Dynamic), based on [Qwen/Qwen3-Reranker-4B](https://huggingface.co/Qwen/Qwen3-Reranker-4B)
* **Applications**: Bebbi Bot (knowledge bases).

#### Qwen 3 0.6B Embedding and Reranker — ⚪ Retired
The 0.6B versions of the two models above. Replaced by the 4B versions.
* **Hugging Face Model**: [Qwen/Qwen3-Embedding-0.6B-GGUF](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B-GGUF) and [Qwen/Qwen3-Reranker-0.6B](https://huggingface.co/Qwen/Qwen3-Reranker-0.6B)

---

### 3. Named Entity Recognition

#### GLiNER2 Multi — 🟢 Active
Finds entities of any type you name in a request (people, addresses, case numbers, and so on), with a confidence score and character offsets for each hit. No fine-tuning needed for new entity types. Runs behind our own REST API ([dcc-gliner-api](https://github.com/DCC-BS/dcc-gliner-api)), not an OpenAI-compatible one.
* **Hugging Face Model**: [fastino/gliner2-multi-v1](https://huggingface.co/fastino/gliner2-multi-v1)
* **Applications**: AnonyMate (finds personal data to redact).

---

### 4. Audio Processing (Speech-to-Text)

#### FasterWhisper — 🟢 Active
Speech-to-text runtime for transcription and speaker indexing.
* **Description**: OpenAI's Whisper model optimized with CTranslate2, combined with PyAnnote diarization for speaker indexing.
* **Hugging Face Model**: [openai/whisper-large-v2](https://huggingface.co/openai/whisper-large-v2) (Transcription) and [pyannote/speaker-diarization-community-1](https://huggingface.co/pyannote/speaker-diarization-community-1) (Speaker Diarization)
* **Applications**: Transcribo, BS-Übersetzer, Kantonspolizei Berichtgenerator, DCC Berichtgenerator.

---

### 5. Optical Character Recognition (OCR)

#### GLM-OCR — 🟢 Active
OCR engine for multi-lingual document layouts; extracts text from scanned images and forms.
* **Hugging Face Model**: [zai-org/GLM-OCR](https://huggingface.co/zai-org/GLM-OCR)
* **Applications**: RPA (Robotic Process Automation) workloads in the GD department, StatA survey questionnaires.

#### PP-OCRv6 — 🟢 Active
OCR engine for printed text inside Docling. Runs locally in the Docling worker, next to GLM-OCR for handwriting. See [Docling PP-OCRv6 Plugin](/docling/pp-ocrv6).
* **Hugging Face Model**: [PaddlePaddle/PP-OCRv6_medium_det_onnx](https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_det_onnx) (detection) and [PaddlePaddle/PP-OCRv6_medium_rec_onnx](https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_rec_onnx) (recognition)
* **Applications**: Docling (`ocr_preset: "pp-ocrv6"`).

#### Dots.ocr — ⚪ Retired
Alternative OCR engine.
* **Hugging Face Model**: [rednote-hilab/dots.ocr](https://huggingface.co/rednote-hilab/dots.ocr)

---

### 6. Document Processing

#### Docling — 🟢 Active
Layout-aware parser that converts PDF, DOCX, and PPTX files into Markdown or JSON.
* **Official Documentation**: [Docling Core](https://www.docling.ai/)
* **Applications**: Bebbi Bot, TextMate, BS-Übersetzer, AnonyMate, BaselCityGPT, OGD GR Geschäfte.
