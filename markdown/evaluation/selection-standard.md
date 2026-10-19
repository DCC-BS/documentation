# Selection Standard

Before a model runs on the KDKP, it has to pass five yes-or-no checks. If it fails one, we drop it, however well it scores elsewhere. Models that pass are then examined for the job they would do.

This page lists the checks and what we look at for each kind of model. It does not list which models we chose. For that, see [Models & APIs](/infrastructure/models).

The DCC AI team applies this standard. A governance board for model decisions is being established. Full detail is in the [selection standard in the repository](https://github.com/DCC-BS/ai-model-evaluation/blob/main/docs/selection-standard.md).

## Hard gates

1. **Fits our GPUs.** Weights plus KV cache for the target context length and number of parallel users must fit. Today we run H100 80 GB GPUs. An H200 NVL 141 GB is planned. See [GPU Compute Cluster](/infrastructure/hardware).
2. **Fits one server.** We do not serve one model across several servers, because it costs latency and speed. Splitting a model across the GPUs inside one server is fine.
3. **Served by vLLM.** This gives us one serving stack and an OpenAI-compatible API. One exception is documented: speech-to-text runs on FasterWhisper with BentoML. STT candidates without vLLM support, for example NeMo models, can be benchmarked but need a separate serving decision. See [Inference Software Stack](/infrastructure/software).
4. **Permissive licence.** The licence must allow how we use the model.
5. **Hosted on Hugging Face.** We pull the weights from there.

## Investigation per task type

Leaderboards are inputs, not decisions. The decision rests on the gates, our own evaluations, load tests and hands-on use. The layers are described in [How We Test](/evaluation/how-we-test).

### Large language models

[Artificial Analysis](https://artificialanalysis.ai/) is our main outside reference. It is a third-party service with its own method, which we do not control. We read cost, speed, supported inputs, reasoning and whether its effort can be steered, size and memory use, coding, legal and other text tasks, tool use, verbosity, openness and bias.

Then we check what leaderboards do not show:

- Memory for our target context length and quantisation, estimated with [`hf-mem`](https://pypi.org/project/hf-mem/).
- Which quantisation formats are fast and stable on our GPUs, meaning no looping output, and whether the KV cache can be quantised.
- Supported context length.
- Known vLLM issues for that model.
- Community reports and open issues.
- Hands-on use on our own development machines.

### Layout and OCR

We start from public benchmarks such as olmOCR-Bench, OCRBench v2, OmniDocBench and ParseBench. Then we run our own [OCR benchmark](https://github.com/DCC-BS/ai-model-evaluation/blob/main/ocr/README.md) and the document-conversion suite in [dcc-docling-serve](https://github.com/DCC-BS/dcc-docling-serve/tree/main/benchmarks). The full list is in the [repository doc](https://github.com/DCC-BS/ai-model-evaluation/blob/main/docs/selection-standard.md#layout-and-ocr).

### Speech-to-text

We run our own [benchmark](https://github.com/DCC-BS/ai-model-evaluation/blob/main/stt/README.md) on German and Swiss German recordings and measure word error rate (WER), character error rate (CER) and BLEU. Speaker separation and API behaviour are tested in [bentoml-faster-whisper](https://github.com/DCC-BS/bentoml-faster-whisper).

### Embeddings and reranking

We start from the [MTEB leaderboard](https://huggingface.co/spaces/mteb/leaderboard).

### Text-to-speech

No automated metric tells us whether a voice pronounces a Basel place name acceptably. The team listens, using a [written protocol](https://github.com/DCC-BS/ai-model-evaluation/blob/main/tts/LISTENING_PROTOCOL.md): intelligibility, pronunciation of Swiss names and places, naturalness and voice consistency. This is a human judgement, and we say so.

### PII/NER and decision models

We evaluate anonymisation (PII/NER) models and decision models on our own benchmarks. The code is not public yet. See [pii-ner](https://github.com/DCC-BS/ai-model-evaluation/blob/main/pii-ner/README.md) and [decision-models](https://github.com/DCC-BS/ai-model-evaluation/blob/main/decision-models/README.md) for what we test.

## Technical detail: memory check

`hf-mem` reads a model's metadata from Hugging Face and estimates its memory without downloading the weights:

```bash
uvx hf-mem --model-id <org>/<model> --experimental --max-model-len 32768 --batch-size 8 --kv-cache-dtype fp8
```

The KV-cache figure is an estimate. We use it as a first filter for gate 1 and confirm with a real vLLM start on the target hardware. The flags are explained in the [repository doc](https://github.com/DCC-BS/ai-model-evaluation/blob/main/docs/selection-standard.md#memory-check-with-hf-mem).
