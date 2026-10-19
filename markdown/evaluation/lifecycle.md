# Model Lifecycle

AI models age quickly. A model that is a year old has usually been overtaken by newer open models. So we review the models on the KDKP on a schedule, and we replace them in steps that let us go back.

This page describes those steps and the record we keep for each change. The DCC AI team runs the process. A governance board for model decisions is being established.

The status of each model today is in [Models & APIs](/infrastructure/models). Full detail is in the [repository doc](https://github.com/DCC-BS/ai-model-evaluation/blob/main/docs/lifecycle.md).

## Cadence

We review models every 6 to 12 months. We do not wait for a failure before we look at alternatives.

## Steps

1. **Candidate.** A new model is proposed. It has to pass the [hard gates](/evaluation/selection-standard#hard-gates).
2. **Evaluation.** We run layers 1 to 4 from [How We Test](/evaluation/how-we-test).
3. **Transition phase.** The old and new model run side by side. Apps and processes adapt. We compare the two and collect what we see in real use.
4. **Cutover.** Apps switch to the new API URL. We deactivate the old model first and retire it later.

## Rollback

Rollback is a real outcome. We have deactivated a model after a switch because its reasoning traces were far longer than the tasks needed. [Models & APIs](/infrastructure/models) shows its current status.

## Model Decision Record

We write one record for each model change. The records are private. We publish that they exist and what they contain, not the contents. The template is public: [decision record template](https://github.com/DCC-BS/ai-model-evaluation/blob/main/docs/decision-record-template.md).

Fields:

- the change and why it happens now
- candidates considered, with the result of each hard gate
- evaluation runs per layer, with all relevant metrics and a note on any not measured
- load-test results before and after
- transition dates, issues seen and rollback criteria
- the decision, who decided and when
- governance board sign-off, once a board exists

## Other records

- Active, deactivated and retired status in the public model catalog.
- An internal page and the infrastructure change history.
- Load-test results and the evaluation result history. These are private.

## Gaps

At our last model switch we did not capture every relevant metric. The decision record asks for all relevant metrics per layer so that this does not repeat. We have not yet used it across a full cycle.
