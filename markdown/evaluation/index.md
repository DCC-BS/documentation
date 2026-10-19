# AI Model Evaluation

The Canton of Basel-Stadt runs open AI models on its own platform, the KDKP. Before a model goes into use, someone has to decide whether it is good enough for the task and fits our hardware and serving setup. This section describes how we make that decision.

The DCC AI team selects and evaluates all models on the KDKP. A governance board for model decisions is being established. It does not exist yet, so for now the responsibility sits with the team.

We publish the method: the criteria, the steps and the evaluation code. We do not publish test data, scores or rankings. Our test data contains work content from real people, so it stays private. The section on [limits](#what-we-do-not-publish-and-what-is-missing) lists what you cannot check from the outside.

## Principles

- **Our own data before leaderboards.** A public ranking tells us where to look. We then test on German and Swiss German material close to our work.
- **No single number decides.** A model must pass hard gates, then we look at several measures, load behaviour and hands-on use.
- **People decide.** The team makes the call and writes it down. Scores support the decision, they do not make it.
- **Transition before cutover.** The old and the new model run side by side until we have seen the new one in real use. A model can be rolled back.
- **Method public, data and results private.** You can read and run the code. You cannot reproduce our internal numbers.

## In this section

| Page | What it covers |
|---|---|
| [Selection Standard](/evaluation/selection-standard) | The five hard gates and what we look at for each task type |
| [How We Test](/evaluation/how-we-test) | Five test layers, with links to the code |
| [Model Lifecycle](/evaluation/lifecycle) | Review cadence, transition, rollback and the decision record |

The current model catalog is on [Models & APIs](/infrastructure/models). The hardware the gates refer to is on [GPU Compute Cluster](/infrastructure/hardware), and the serving stack is on [Inference Software Stack](/infrastructure/software).

## What we do not publish, and what is missing

- Test data, results, scores and rankings.
- Code for PII/NER (anonymisation) and decision-model evaluation. We evaluate these models on our own benchmarks, but the code is not public yet.
- Text-to-speech is judged by listening, with a written protocol. No automated metric backs it.
- The governance board is not set up.
- At our last model switch we did not capture every relevant metric. The [decision record](/evaluation/lifecycle#model-decision-record) is meant to prevent that.

## For other cantons

You can reuse the method. Start with the [selection standard](https://github.com/DCC-BS/ai-model-evaluation/blob/main/docs/selection-standard.md) and the [decision record template](https://github.com/DCC-BS/ai-model-evaluation/blob/main/docs/decision-record-template.md). The [data policy](https://github.com/DCC-BS/ai-model-evaluation/blob/main/docs/data-policy.md) explains how to run the evaluation suites on your own data. The full repository is at [DCC-BS/ai-model-evaluation](https://github.com/DCC-BS/ai-model-evaluation).
