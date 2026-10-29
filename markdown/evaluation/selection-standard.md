# Selection standard

Every model on the KDKP has to pass five basic checks. A model that fails one of them is out, however well it scores in public rankings. For the models that pass, we then look closer at the job they would do.

This page lists the checks and what we look at for each kind of model. The models we picked are listed on [Models & APIs](/infrastructure/models).

The DCC AI team applies this standard. We are setting up a governance board for model decisions. The [selection standard in the repository](https://github.com/DCC-BS/ai-model-evaluation/blob/main/docs/selection-standard.md) has the full technical detail.

## The five basic checks

1. **It fits on our graphics cards.** The model and its working memory must fit on our GPUs, with room for long texts and many users at once. Today we use NVIDIA H100 NVL cards with 94 GB of memory each. Cards with 141 GB (H200 NVL) are planned. See [GPU Compute Cluster](/infrastructure/hardware).
2. **It runs on a single server.** Spreading one model over several servers makes it slower, so we don't do it. Using several graphics cards inside the same server is fine.
3. **It runs on vLLM.** We use one program, vLLM, to run all our language models. That keeps operations simple and gives every app the same kind of interface. Speech-to-text is the one exception. It runs on FasterWhisper with BentoML. If a speech model doesn't work with vLLM, we can still test it, and then decide separately how we would run it. See [Inference Software Stack](/infrastructure/software).
4. **Its licence allows our use.** We read the licence and check that it covers what we want to do with the model.
5. **It is published on Hugging Face.** We download all our models from there.

## What we look at for each kind of model

Public rankings help us decide which models are worth a closer look. The decision itself comes from the five checks, our own tests, load tests and our own experience with the model. [How we test](/evaluation/how-we-test) describes these rounds.

### Language models

Our main outside source is [Artificial Analysis](https://artificialanalysis.ai/). It is an independent website with its own way of measuring, which we have no say in. There we compare price, speed, which kinds of input a model accepts, how well it reasons and whether we can control how long it thinks, its size and memory needs, how well it writes code, handles legal and other texts and uses tools, how wordy it is, how open its makers are about it, and how biased it is.

Then we check the things rankings can't tell us:

- How much memory the model needs for our text lengths. The tool [`hf-mem`](https://pypi.org/project/hf-mem/) gives us a first estimate.
- Which compressed version of the model runs fast and reliably on our cards. A reliable version doesn't get stuck repeating itself and doesn't slip foreign characters into German words. We measure both with the [Bebbi Bot suites](/evaluation/bebbi-bot#model-behaviour). For Gemma 4, the 4-bit versions did the second about 2.5 times as often as the 8-bit one.
- How long a text the model can handle.
- Known problems with the model in vLLM.
- What other users report about it.
- How it feels to work with it on our own computers.
- How it works inside our apps: whether it calls tools correctly, cites its sources and edits files without breaking them. Round 3 of [How we test](/evaluation/how-we-test) covers this.

### Reading documents (layout and OCR)

We start with public tests such as olmOCR-Bench, OCRBench v2, OmniDocBench and ParseBench. Then we run our own [OCR test](https://github.com/DCC-BS/ai-model-evaluation/blob/main/ocr/README.md) and the document conversion tests in [dcc-docling-serve](https://github.com/DCC-BS/dcc-docling-serve/tree/main/benchmarks). The [repository](https://github.com/DCC-BS/ai-model-evaluation/blob/main/docs/selection-standard.md#layout-and-ocr) has the full list.

### Speech-to-text

We run our own [test](https://github.com/DCC-BS/ai-model-evaluation/blob/main/stt/README.md) with German and Swiss German recordings. We count how many words and letters the model gets wrong. The tests in [bentoml-faster-whisper](https://github.com/DCC-BS/bentoml-faster-whisper) check whether the service tells speakers apart correctly and whether it behaves as expected.

### Search (embeddings and reranking)

We start with the public [MTEB leaderboard](https://huggingface.co/spaces/mteb/leaderboard).

### Synthetic voices (text-to-speech)

We know of no automatic test that tells us whether a voice says "Kleinhüningen" properly. So we listen ourselves and follow a [written checklist](https://github.com/DCC-BS/ai-model-evaluation/blob/main/tts/LISTENING_PROTOCOL.md). It covers whether we understand the voice, whether it pronounces Swiss names and places correctly, whether it sounds natural, and whether it stays the same voice from sentence to sentence. In the end this is a human judgement.

### Anonymisation and decision models

We also test models that find personal data in texts, and models that support decisions, with our own tests. That code isn't public yet. The short descriptions in [pii-ner](https://github.com/DCC-BS/ai-model-evaluation/blob/main/pii-ner/README.md) and [decision-models](https://github.com/DCC-BS/ai-model-evaluation/blob/main/decision-models/README.md) say what we test.
