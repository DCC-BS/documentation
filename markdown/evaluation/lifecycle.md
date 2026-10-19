# Model lifecycle

AI models get old fast. We assume that after about a year, newer open models will do the same job better. So we review our models on a fixed schedule, and we switch in small steps that let us go back if needed.

This page describes those steps and what we write down for each change. The DCC AI team runs this process. We are setting up a governance board for model decisions.

[Models & APIs](/infrastructure/models) shows which models are in use today. The [repository](https://github.com/DCC-BS/ai-model-evaluation/blob/main/docs/lifecycle.md) has more detail.

## How often we review

Every 6 to 12 months we look at what is available and compare it with what we run. We start looking before something breaks.

## How a switch works

1. **Candidate.** Someone proposes a new model. It has to pass the [five basic checks](/evaluation/selection-standard#the-five-basic-checks).
2. **Testing.** We run rounds 1 to 4 from [How we test](/evaluation/how-we-test).
3. **Running both.** The old and the new model run side by side for a while. Apps and workflows get adjusted, and we compare the two in real use.
4. **Switching over.** The apps move to the new model. We first switch the old model off, and remove it completely some time later.

## Going back

Sometimes we go back. Once we switched off a new model again because it wrote long chains of reasoning for tasks that needed a short answer. Its status is on [Models & APIs](/infrastructure/models).

## Model decision record

For every model change we fill in a decision record. These records are internal. The empty [template](https://github.com/DCC-BS/ai-model-evaluation/blob/main/docs/decision-record-template.md) is public, so you can see what we write down:

- what changes, and why now
- which models we considered, and how each did in the five basic checks
- the test results from each round, and a note on anything we didn't measure
- load test results before and after the switch
- when the two models ran side by side, what went wrong, and when we would go back
- what we decided, who decided, and when
- the governance board's approval, once the board exists

## Other records we keep

- The status of each model (in use, switched off or removed) in the public [model list](/infrastructure/models).
- An internal page and the change history of our infrastructure.
- Load test results and earlier test results. These are private.

## What we still need to improve

When we last switched models, we didn't record every measurement we should have. The decision record now asks for all of them, round by round. We introduced it recently, so it hasn't gone through a full switch yet.
