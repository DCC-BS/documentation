# AI model evaluation

The Canton of Basel-Stadt runs open AI models on its own platform, the KDKP. Before we put a model into use, we check whether it does the job well and whether it runs on our servers. This section explains how we do that.

The DCC AI team chooses and tests every model on the KDKP. We are setting up a governance board for these decisions. Until it exists, the team carries the responsibility.

We publish how we work, including our rules, our steps and our test code. We keep our test data and our results to ourselves, because the data comes from the daily work of real people. Further down this page we list what you can't check from the outside.

## How we work

- **We test on our own material.** Public rankings help us find candidates. After that, we test with German and Swiss German texts and recordings that look like our daily work.
- **We look at many things at once.** A model first has to pass five basic checks. Then we compare test results, see how it copes with many users at the same time, and use it ourselves.
- **People make the decision.** The team decides and writes down why. Test results help us, and the final call is ours.
- **We switch over slowly.** For a while, the old and the new model run side by side. If the new one causes problems, we go back to the old one.
- **We share the method and keep the data.** You can read and run our test code. You can't repeat our results, because they come from our internal data.

## Pages in this section

| Page | What it covers |
|---|---|
| [Selection standard](/evaluation/selection-standard) | The five basic checks, and what else we look at for each kind of model |
| [How we test](/evaluation/how-we-test) | The five rounds of testing, with links to the code |
| [Model lifecycle](/evaluation/lifecycle) | How often we review models, how we switch, and what we write down |
| [Testing Bebbi Bot](/evaluation/bebbi-bot) | The test suites of our chat assistant: Office files, citations, model habits, load |

The list of models we run today is on [Models & APIs](/infrastructure/models). Our servers are described on [GPU Compute Cluster](/infrastructure/hardware), and the software that runs the models on [Inference Software Stack](/infrastructure/software).

## What we don't publish, and what is still missing

- We don't publish test data, results, scores or rankings.
- We also test models that find personal data in texts (for anonymisation) and models that support decisions. That test code isn't public yet.
- The test suites of Bebbi Bot are in an internal repository of IT BS. We describe them, but the code isn't public.
- We judge synthetic voices by listening to them, following a written checklist. We have no automatic score for voices.
- The governance board doesn't exist yet.
- When we last switched models, we didn't record every measurement we should have. The [decision record](/evaluation/lifecycle#model-decision-record) now asks for all of them.

## For other cantons

You are welcome to reuse our approach. Good starting points are the [selection standard](https://github.com/DCC-BS/ai-model-evaluation/blob/main/docs/selection-standard.md) and the [decision record template](https://github.com/DCC-BS/ai-model-evaluation/blob/main/docs/decision-record-template.md). The [data policy](https://github.com/DCC-BS/ai-model-evaluation/blob/main/docs/data-policy.md) explains how to run the tests on your own data. All code is in [DCC-BS/ai-model-evaluation](https://github.com/DCC-BS/ai-model-evaluation). To run it you need uv, a running model server and Docker with a GPU. The [quick start](https://github.com/DCC-BS/ai-model-evaluation/blob/main/README.md#quick-start) walks you through the setup.
