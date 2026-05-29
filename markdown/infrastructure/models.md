# Hosted Models & AI APIs

To enable seamless integration across all cantonal departments, the **KDKP** hosts a variety of state-of-the-art Open-Source models through standardized, OpenAI-compatible APIs. 

---

## Getting Started

All KDKP Large Language Models, Embeddings, and Rerankers are exposed via standard, OpenAI-compliant endpoints. To help developers quickly integrate these services into their applications, we provide pre-configured templates, credentials setups, and best practices for cantonal network truststore integration.

> [!TIP]
> **API Starter Code Repository**
> Ready-to-use client libraries, connection scripts, and usage examples for Python and other runtimes are available in the public **[DCC-BS kdkp-api-starter-code](https://github.com/DCC-BS/kdkp-api-starter-code)** repository.

---

## Model Catalog

Our model ecosystem is grouped by function: Large Language Models (LLM), Text Embeddings, Audio processing, Optical Character Recognition (OCR), and Document parsing.

### 1. Large Language Models (LLM)

#### Gemma 4 31B
Our current flagship general-purpose Large Language Model, developed by Google and optimized for high-performance low-precision execution. It includes advanced reasoning, native tool-use, and vision (image/video) capabilities.
* **Hugging Face Model**: [RedHatAI/gemma-4-31B-it-NVFP4](https://huggingface.co/RedHatAI/gemma-4-31B-it-NVFP4)
* **Applications**: TextMate, BS-Übersetzer, RAG Bot, Polizeiberichtgenerator.

#### Qwen 3 32B
A highly capable reasoning LLM developed by Alibaba, featuring a large context window and strong multilingual capabilities. *(Scheduled for retirement shortly in favor of Gemma 4)*.
* **Hugging Face Model**: [Qwen/Qwen3-32B-AWQ](https://huggingface.co/Qwen/Qwen3-32B-AWQ)
* **Applications**: TextMate, BS-Übersetzer, Berichtgenerator, RAG Bot, Polizeiberichtgenerator.

#### Qwen 3.5 27B
A multimodal reasoning model from Alibaba. *(Temporarily deactivated due to high token generation overhead during reasoning tasks)*.
* **Hugging Face Model**: [Qwen/Qwen3.5-27B-FP8](https://huggingface.co/Qwen/Qwen3.5-27B-FP8)
* **Applications**: Under active evaluation.

#### Gemma 3 27B
A large vision-language model developed by Google. *(Retired)*.
* **Hugging Face Model**: [ISTA-DASLab/gemma-3-27b-it-GPTQ-4b-128g](https://huggingface.co/ISTA-DASLab/gemma-3-27b-it-GPTQ-4b-128g)
* **Applications**: Retired (previously used for experimental visual tasks).

#### Llama 3.3 70B
A high-capacity generative text model developed by Meta AI. *(Retired)*.
* **Hugging Face Model**: [cortecs/Llama-3.3-70B-Instruct-FP8-Dynamic](https://huggingface.co/cortecs/Llama-3.3-70B-Instruct-FP8-Dynamic)
* **Applications**: Retired.

---

### 2. Embeddings & Rerankers

Embeddings and Rerankers form the mathematical core of our retrieval pipelines, powering semantic search lookup and RAG assistants.

#### Qwen 3 0.6B Embedding
A lightweight, high-performance text embedding model used to translate cantonal documents and queries into dense vector mathematical representations.
* **Hugging Face Model**: [Qwen/Qwen3-Embedding-0.6B-GGUF](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B-GGUF)
* **Applications**: RAG Bot.

#### Qwen 3 0.6B Reranker
A lightweight cross-encoder model used to dynamically re-score and re-order search results for optimal accuracy.
* **Hugging Face Model**: [Qwen/Qwen3-Reranker-0.6B](https://huggingface.co/Qwen/Qwen3-Reranker-0.6B)
* **Applications**: RAG Bot.

---

### 3. Audio Processing (Speech-to-Text)

#### FasterWhisper
An optimized speech-to-text inference runtime providing rapid transcription and speaker indexing.
* **Description**: OpenAI's Whisper model optimized with CTranslate2, coupled with PyAnnote community diarization for speaker indexing.
* **Hugging Face Model**: [openai/whisper-large-v2](https://huggingface.co/openai/whisper-large-v2) (Transcription) and [pyannote/speaker-diarization-community-1](https://huggingface.co/pyannote/speaker-diarization-community-1) (Speaker Diarization)
* **Applications**: Transcribo, Kantonspolizei Polizeiberichtgenerator, DCC Berichtgenerator.

---

### 4. Optical Character Recognition (OCR)

#### GLM-OCR
Our primary active OCR engine, specialized in parsing multi-lingual document layouts and extracting clean text from scanned images and forms.
* **Hugging Face Model**: [zai-org/GLM-OCR](https://huggingface.co/zai-org/GLM-OCR)
* **Applications**: RPA (Robotic Process Automation) workloads in the GD department, StatA survey questionnaires.

#### Dots.ocr
An alternative optical character recognition engine. *(Retired)*.
* **Hugging Face Model**: [rednote-hilab/dots.ocr](https://huggingface.co/rednote-hilab/dots.ocr)
* **Applications**: Retired.

---

### 5. Document Processing

#### Docling
A layout-aware PDF and document parser used to partition PDFs, DOCX, and PPTX files into clean Markdown or JSON structures.
* **Description**: Layout-aware semantic parsing engine.
* **Official Documentation**: [Docling Core](https://www.docling.ai/)
* **Applications**: TextMate, BS-Übersetzer, OGD GR Geschäfte.
