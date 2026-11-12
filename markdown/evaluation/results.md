# Test results

This page lists the models we tested and how they did. It covers models we use and models we turned down.

How much we publish depends on the test data:

- **Public or made-up data.** We publish the full scores. You can run the same test and should get the same numbers. The code is linked in each section.
- **Our own data.** We publish one total per model for the whole test set. We never publish the recordings, the documents, the transcripts, the model outputs or the score of a single item. You can't repeat these numbers, because you don't have the data.

The test code and method are described on [How we test](/evaluation/how-we-test). The models we run today are on [Models & APIs](/infrastructure/models).

## How to read the scores

- **WER** (word error rate) and **CER** (character error rate) count the words and letters a model gets wrong, compared with a reference text. Lower is better. 0.20 means one wrong word in five.
- A WER above 1 means the model wrote more wrong words than the reference has words. This usually happens when a model gets stuck and repeats itself.
- **Status** is what we decided: *in use*, *chosen* (decided, not live yet) or *not adopted*.
- A score belongs to one test set on one date. A model that does badly on our Swiss German may do well on something else.

## Speech-to-text

The test data is our own: 33 dictated reports in Swiss German, about 2 hours 50 minutes in total, from three use cases, some structured and some free. The reference text is in Standard German, with punctuation and with numbers written as digits. So a model has to understand Swiss German and write Standard German.

The test doesn't normalise the text. Wrong capitals and punctuation count as errors. Code: [stt](https://github.com/DCC-BS/ai-model-evaluation/blob/main/stt/README.md).

| Model | Tested | WER | CER | Status | Notes |
|---|---|---:|---:|---|---|
| [Voxtral Small 24B](https://huggingface.co/RedHatAI/Voxtral-Small-24B-2507-FP8-dynamic) (FP8) | Jul 2026 | 0.41 | 0.14 | not adopted | Slightly better than Whisper large-v2, but much bigger and slower. The gain isn't worth the GPUs |
| [Whisper large-v2](https://huggingface.co/openai/whisper-large-v2) (faster-whisper) | Jun to Jul 2026 | 0.45 to 0.47 | 0.15 to 0.19 | in use | 11 runs with different settings of our transcription service |
| [Whisper large-v3](https://huggingface.co/openai/whisper-large-v3) (faster-whisper) | Jun to Jul 2026 | 0.49 to 0.56 | 0.19 to 0.25 | not adopted | Worse than large-v2 on our recordings |
| [Parakeet TDT 0.6B v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3) | Jul 2026 | 0.58 | 0.21 | not adopted | |
| [Nemotron 3.5 Transcribe 30B-A4B](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-FP8) (FP8) | Nov 2026 | 0.64 | 0.30 | not adopted | Writes Swiss German as it sounds ("erpressig") and spells out numbers. Best of four prompts, the others scored 0.70 to 0.78 |
| [MOSS-Transcribe-Diarize](https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize) | Jul 2026 | 0.78 | 0.31 | not adopted | |
| [VibeVoice](https://github.com/microsoft/VibeVoice) | Jun to Jul 2026 | 0.84 to 0.91 | 0.71 to 0.85 | not adopted | |
| [Nemotron 3.5 ASR Streaming 0.6B](https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b) | Jun to Jul 2026 | 0.89 | 0.54 | not adopted | |
| [Granite 4.0 1B Speech](https://huggingface.co/ibm-granite/granite-4.0-1b-speech) | Jun to Jul 2026 | 1.71 | 1.04 | not adopted | Repeats itself |
| [Granite Speech 4.1 2B Plus](https://huggingface.co/ibm-granite/granite-speech-4.1-2b-plus) | Jun to Jul 2026 | 7.3 to 7.6 | 5.0 to 5.2 | not adopted | Repeats itself |

A range means we ran the model more than once, with other settings or on another date. Apart from Voxtral, we turned the other models down because they score worse than Whisper large-v2.

## Reading handwriting

The test data is public: all 10,854 lines of German handwriting in [fhswf/german_handwriting](https://huggingface.co/datasets/fhswf/german_handwriting). Code: [ocr](https://github.com/DCC-BS/ai-model-evaluation/blob/main/ocr/README.md). We keep older versions in the table, such as PaddleOCR-VL-1.5 next to 1.6 and LightOnOCR-2 next to 3, so it shows how the models change over time.

*Raw* compares the output as it comes. *Normalised* first removes capitals and punctuation on both sides, so it shows how much of the error is only formatting. *Time* is for all lines on one RTX 4090.

| Model | Tested | WER raw | CER raw | WER normalised | CER normalised | Time | Status |
|---|---|---:|---:|---:|---:|---:|---|
| [GLM-OCR](https://huggingface.co/zai-org/GLM-OCR) | Nov 2026 | 0.30 | 0.075 | 0.24 | 0.065 | 301 s | in use |
| [LightOnOCR-3-4B](https://huggingface.co/lightonai/LightOnOCR-3-4B) | Nov 2026 | 0.22 | 0.115 | 0.20 | 0.100 | 637 s | not adopted |
| [PaddleOCR-VL-1.6](https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6) | Nov 2026 | 0.39 | 0.121 | 0.35 | 0.110 | 276 s | not adopted |
| [PaddleOCR-VL-1.5](https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.5) | Feb 2026 | 0.41 | 0.134 | 0.36 | 0.116 | 278 s | not adopted |
| [olmOCR-2-7B](https://huggingface.co/allenai/olmOCR-2-7B-1025-FP8) | Feb 2026 | 0.30 | 0.140 | 0.23 | 0.122 | 758 s | not adopted |
| [Nemotron-3.5-Parse](https://huggingface.co/nvidia/Nemotron-3.5-Parse) | Nov 2026 | 0.57 | 0.258 | 0.47 | 0.202 | 183 s | not adopted |
| [dots.ocr](https://huggingface.co/dots-studio/dots.ocr) | Feb 2026 | 0.49 | 0.266 | 0.45 | 0.253 | 713 s | not adopted |
| [DeepSeek-OCR-2](https://huggingface.co/deepseek-ai/DeepSeek-OCR-2) | Feb 2026 | 0.72 | 0.439 | 0.68 | 0.391 | 1,489 s | not adopted |
| [LightOnOCR-2-1B](https://huggingface.co/lightonai/LightOnOCR-2-1B) | Feb 2026 | 0.76 | 0.674 | 0.64 | 0.460 | 363 s | not adopted |
| [Unlimited-OCR-2](https://huggingface.co/baidu/Unlimited-OCR-2) | Nov 2026 | 1.08 | 0.679 | 0.96 | 0.544 | 3,819 s | not adopted |

![Error rates of all handwriting models on 10,854 lines, sorted from best to worst, with run time under each name](/imgs/evaluation/ocr-handwriting.png)

GLM-OCR scored the same in February and November (CER 0.075). LightOnOCR-3 gets fewer words wrong than GLM-OCR but 1.5 times as many letters, because it returns nothing for some lines and cuts off the end of others. It is still a large step up from LightOnOCR-2; PaddleOCR-VL-1.6 improves only a little on 1.5. Nemotron-3.5-Parse is built for whole pages and invents text on some single lines. Unlimited-OCR-2 also parses whole pages only, so we put each line on a blank A4 page first. It still returns nothing for some lines and on others repeats a fragment until it hits its token limit, and it is more than 12 times slower than GLM-OCR. Baidu's own reference code gives the same answers. The [OCR README](https://github.com/DCC-BS/ai-model-evaluation/blob/main/ocr/README.md#models-tested-in-october-2026) lists the weaknesses of each model.

Runs from October and early November 2026 used only the first 500 lines and are not in this table. GLM-OCR has CER 0.039 on those lines and 0.075 on all of them, so scores from the two sets can't be compared.

## Document conversion

The test data is made-up administrative documents with known content, and public documents such as an EU regulation and the Basel-Stadt Legislaturplan. Code and summary tables: [dcc-docling-serve/benchmarks](https://github.com/DCC-BS/dcc-docling-serve/tree/main/benchmarks). The scores per configuration and per public document are in our private [results repository](https://github.com/DCC-BS/ai-model-evaluation-results/blob/main/docling/README.md).

| Tool | Status | What we found |
|---|---|---|
| [Docling](https://www.docling.ai/), GPU OCR | in use | Same Markdown as before on 22 of 27 documents, the rest at least 97.7 % alike. 165 s for all documents instead of 1,300 s |
| Marker | not adopted | Best match with the made-up documents (text F1 0.98, reading order 0.99) and the only tool that writes formulas. Slowest per page, 2.5 minutes to start, and loses the body of long tables |
| MarkItDown, Jina Reader | not adopted | Mostly flat text, no OCR. Scanned pages come out almost empty |
| docTR | not adopted | OCR only. Reads text inside pictures, but makes OCR errors even on digital pages and has weak tables |

Inside Docling we also compared OCR and layout engines, last in October and November 2026 on 96 documents. Docling runs two OCR engines side by side, and each request picks one.

| OCR and layout | Status | What we found |
|---|---|---|
| [PP-OCRv6](/docling/pp-ocrv6) ([model](https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_rec_onnx)) with [PP-DocLayout-V3](https://huggingface.co/PaddlePaddle/PP-DocLayoutV3) | in use, for print | Best setup without a vision-language model on plans and administrative documents (F1 0.95 on the made-up documents, 84 % of the text in the PDF text layers found). Slightly better than RapidOCR, Docling's default, at the same speed. Can't read handwriting (39 % of a handwritten note) |
| [GLM-OCR](/docling/glm-ocr) ([model](https://huggingface.co/zai-org/GLM-OCR)) with [PP-DocLayout-V3](https://huggingface.co/PaddlePaddle/PP-DocLayoutV3) | in use, for handwriting | Best on handwriting and photos (96 % of the note, 89 % of handwriting in a phone photo). Can misread a word in a way that changes the meaning, and described a photo without text in one English paragraph |
| [Nemotron OCR v2](https://huggingface.co/nvidia/nemotron-ocr-v2) | not adopted | Worse on German text: its recogniser is English-only, so umlauts and ß come out wrong or missing (precision 0.83 to 0.91 on the German XFUND forms, against 0.94 for PP-OCRv6), and it reads 62 % of the handwritten note. On its own it is the fastest engine, but it needs torch 2.11, which makes the rest of the pipeline (RapidOCR, layout, TableFormer) about 7 times slower in the same image |
| Egret layout models ([medium](https://huggingface.co/docling-project/docling-layout-egret-medium), [large](https://huggingface.co/docling-project/docling-layout-egret-large), [xlarge](https://huggingface.co/docling-project/docling-layout-egret-xlarge)) | not adopted | No gain over the default layout, and they miss the labels on building plans |
| [Nemotron 3.5 Parse](https://huggingface.co/nvidia/Nemotron-3.5-Parse) | not adopted | Good tables and headings, but it converts every page with a vision-language model and is about 2 times slower than GLM-OCR. On large plan drawings it runs out of output tokens and returns an empty page |
| [LightOnOCR-3-4B](https://huggingface.co/lightonai/LightOnOCR-3-4B) | not adopted | Reads handwriting and photos best, but converts every page with a vision-language model and is about 10 times slower than GLM-OCR inside Docling. Inside Docling it loses every table, see below |
| [Unlimited-OCR-2](https://huggingface.co/baidu/Unlimited-OCR-2) | not adopted | Quality close to the OCR engines (F1 0.93 on the made-up documents), but it converts every page with a vision-language model and is about 10 times slower than GLM-OCR. Sending the whole document in one request, as the model card does, is slower still and ends in repetition loops on some documents |

### LightOnOCR-3 with and without Docling

In November 2026 we also ran LightOnOCR-3-4B without Docling, with [LightOn's own client](https://github.com/lightonai/LightOnOCR): every page of a document sent at once, headers and footers left out. Same 96 documents, one pass, one RTX 4090.

| Setup | Time | Text F1 (made-up documents) | Tables | Precision on XFUND forms |
|---|---:|---:|---:|---:|
| LightOnOCR-3 inside Docling | 4,933 s | 0.69 | 0.00 | 0.68 |
| LightOnOCR-3 with LightOn's client | 2,457 s | 0.94 | 0.99 | 0.98 |

The lost tables are Docling's doing: LightOnOCR-3 writes tables as HTML, and Docling escapes that HTML into plain text. The two setups also prompt the model differently. Inside Docling it runs in plain transcription mode, which writes page headers and footers too; LightOn's client asks for labelled blocks and drops headers and footers. The lower text scores inside Docling come from both, and this test doesn't separate them. On its own the model reads about as well as our OCR engines and is twice as fast as inside Docling. It is still 5 times slower than GLM-OCR in Docling.

We still don't use the client instead of Docling. It turns a PDF or an image into Markdown and nothing more. Docling does more for us:

- **It uses the text that is already in a PDF.** Docling OCRs only scans and pictures. The client has the model retype every page, which is where its time goes.
- **It reads more formats.** The client takes PDFs and images. Docling also converts Word, PowerPoint, Excel and HTML files.
- **It returns the structure.** Docling returns headings, lists, table cells and pictures, each with its page and position, and splits documents into chunks for search. The client returns Markdown with HTML tables.
- **It is a service.** Our [Docling image](/docling/serve) gives the applications an HTTP API with queued jobs, a web UI and the OCR engine chosen per request. With the client we would have to build and run that ourselves, next to a GPU server for the model.

The client does write a short description of each picture and turns charts into tables, which Docling doesn't. If we adopt LightOnOCR-3 for handwriting, it will be inside Docling, once Docling keeps its tables.

## Deep research

The test data is public: 20 English tasks from [DeepResearch Bench](https://github.com/Ayanami0730/deep_research_bench), and a German set of administrative questions that we wrote ourselves, with no personal data. All engines ran on Gemma 4 31B, the model we use in production, in October 2026. Code: [deep-research-evaluation](https://github.com/DCC-BS/deep-research-evaluation). Summary: [bebbi-deep-research](https://github.com/DCC-BS/bebbi-deep-research/blob/main/docs/evaluation.md).

| Engine | Report quality (RACE) | Correct citations | Tokens per report (median) | Time per report | Status |
|---|---:|---:|---:|---:|---|
| Our own engine | 46.1 | 82.5 % | 169k | 6.0 min | chosen |
| GPT-Researcher, with our fixes | 46.3 | 75.7 % | 282k | 13.6 min | not adopted |
| NVIDIA Deep Researcher | 46.5 (lean setup 45.2) | 62.6 % (lean) | 775k | 13.8 min | not adopted |
| Gemma without search | 43.9 | | | | baseline |

Differences in report quality below 1.5 points are noise, and no engine is 3 points better than Gemma without search. The model limits the quality, so we chose on citations, tokens and time. On the German set, our engine reached 66.6 %, a simple loop with the same tools 58.9 % and NVIDIA Deep Researcher 54.6 %.

## Chat assistant

The suites for Bebbi Bot use public laws, public open data and made-up documents. [Testing Bebbi Bot](/evaluation/bebbi-bot) describes them, and the [knowledge base page](/apps/bebbi-bot/knowledge.md#measurements) shows some of their numbers.

## Not on this page yet

- **Anonymisation and decision models.** Both run on our own data. We will add one total per model, as for speech-to-text.
- **Synthetic voices.** We judge them by listening, so there is no score.
- **Load tests.** The numbers depend on our servers and change with every vLLM version. We keep them with the decision record of each model change.

## What these numbers can't tell you

- Our speech-to-text set has 33 recordings from one kind of work. It shows which models cope with Swiss German dictation, not how they do on meetings or Standard German.
- Most models ran once with one setting. A single run can be off by a few points.
- We use the prompt from each model card and don't tune prompts for each model. A better prompt can change a score.
- Voxtral and Nemotron 3.5 Transcribe ran in compressed form (FP8) on two 24 GB GPUs, which are smaller than our production GPUs.
