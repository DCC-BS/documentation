# AI Inference Software Stack

The Canton of Basel-Stadt's AI inference platform is built on an enterprise, fully open-source-aligned software stack. This page documents the operational layers that orchestrate model serving, gateway routing, GitOps deployment, and real-time observability.

---

## The Technology Layers

Our AI platform is divided into five architectural layers, structured from the raw hardware virtualization up to the user-facing routing gateways.

```
┌────────────────────────────────────────────────────────┐
│                  1. API Gateway                        │
│                    - Tyk.io                            │
├────────────────────────────────────────────────────────┤
│           2. Model Inference & Auto-scaling            │
│  - vLLM Engine  •  BentoML (FasterWhisper)  •  KEDA    │
├────────────────────────────────────────────────────────┤
│          3. Orchestration & Secret Injectors           │
│      - NVIDIA Run:ai  •  SOPS Encrypted Secrets        │
├────────────────────────────────────────────────────────┤
│             4. Compute & Driver Virtualization         │
│     - VMware vSphere VKS  •  NVIDIA GPU Operator       │
└────────────────────────────────────────────────────────┘
```

### 1. Compute & Driver Virtualization
* **VMware vSphere Kubernetes Service (VKS)**: The foundational Kubernetes orchestration platform. It allows on-premise, enterprise-grade provisioning of compute nodes, tight integration with software-defined networking, and persistent storage arrays.
* **NVIDIA GPU Operator**: Automates the provisioning and lifecycle management of all NVIDIA software components in Kubernetes. It injects the underlying GPU drivers, configures the container runtime, exposes the GPU device plugin, and runs GPU health telemetry.

### 2. Model Serving & Autoscaling
* **vLLM (Large Language Model Inference)**: The core engine used to host our Large Language Models. `vLLM` is chosen for its extreme throughput and state-of-the-art memory management via **PagedAttention**, which dynamically allocates Key-Value (KV) cache memory to maximize token generation speed.
* **FasterWhisper + BentoML (Speech-to-Text)**: Standard Speech-to-Text inference is implemented using `FasterWhisper` (a highly optimized CTranslate2 implementation of OpenAI’s Whisper model, delivering up to 4x speedup). It is packaged and served using `BentoML`, which abstracts the model runtime and exposes clean HTTP/gRPC interfaces.
* **NVIDIA Run:ai**: Operates as the model-serving and GPU orchestration control plane. It abstracts model deployment schemas, standardizes metadata APIs, schedules workloads across the GPU fleet, and handles green/blue canary routing.
* **KEDA (Kubernetes Event-driven Autoscaling)**: Provides advanced autoscaling capabilities. By integrating with Prometheus request metrics, KEDA scales inference deployments up or down based on incoming concurrent queues. It can scale GPU-consuming pods **down to zero** during idle periods to free up expensive GPU memory for other tasks.

### 3. API Management & Gateway
* **Tyk.io**: The primary enterprise API Gateway and the single gateway currently in production. It oversees cross-tenant communication, enforces firewall policies, manages authentication tokens, applies rate limiting, and maintains detailed audit logs of all network calls.

> [!NOTE]
> A dedicated **LiteLLM AI Gateway / LLM Proxy** is planned for the future (see the [roadmap](#future-technology-roadmap)). It is **not** in use today.

---

## GitOps & Secret Management

The entire platform is managed declaratively, adhering to modern **GitOps** principles to ensure reproducibility, auditability, and fast recovery in case of failures.

```
┌─────────────────┐       Trigger       ┌─────────┐       Sync Specs       ┌────────────────┐
│   GitHub Repos  │ ──────────────────> │ Argo CD │ ─────────────────────> │  VKS Cluster   │
└─────────────────┘                     └─────────┘                        └────────────────┘
                                             ▲
                                             │ Decrypt Secrets
                                    ┌─────────────────┐
                                    │  SOPS (in Git)  │
                                    └─────────────────┘
```

* **Argo CD**: Used for declarative continuous delivery. Argo CD watches our GitHub repositories and automatically synchronizes the cluster state with the YAML manifests defined in git. It manages separate environments, including:
  - **Test Environment**: For rapid integration testing.
  - **UAT Environment**: For performance validation and user acceptance testing.
* **SOPS (Secrets OPerationS)**: Used to secure sensitive environment variables (such as API keys, database credentials, and service tokens) directly in Git. Secrets are stored **encrypted** alongside the manifests and are decrypted only inside the cluster at deploy time, keeping plaintext credentials out of the repository while preserving a fully GitOps-driven workflow.

---

## Observability & DevOps

Continuous monitoring is vital to ensure stable response times and analyze resource allocation. The platform leverages a unified observability stack:

* **Fluent-Bit**: A fast and lightweight log processor that collects stdout/stderr logs from all running model servers and routes them securely.
* **OpenSearch**: Serves as the central log indexing database and search interface, allowing engineers to query application logs and analyze system exceptions.
* **Prometheus**: Periodically scrapes detailed hardware metrics from the NVIDIA GPU Operator (such as GPU temperature, VRAM utilization, power draw) and application metrics from vLLM (concurrency queue size, prompt/generation token rates).
* **Grafana**: Aggregates all telemetry, providing real-time dashboards of cluster health, queue bottlenecks, and active request latency, alongside alerting routing rules.

---

## Future Technology Roadmap

To remain at the cutting edge of AI operations, the DCC and IT BS teams are actively evaluating the following advanced technologies:

> [!TIP]
> **Centralized LLM Proxy**
> We plan to introduce a **LiteLLM AI Gateway / LLM Proxy** in front of the inference backends. It will normalize various models' APIs into OpenAI-compatible schemas and add load balancing across vLLM replicas, failover/fallbacks, and per-tenant rate limiting & token tracking. It is not yet deployed.

> [!NOTE]
> **Managed Secret Store**
> We are evaluating **Azure Key Vault (AKV)** as a managed secret store that would inject credentials into pod memory at startup via secret injectors. Until then, secrets are managed with **SOPS** encrypted in Git.

> [!TIP]
> **Dynamic GPU Sharing**
> We are extending our use of **NVIDIA Run:ai** toward dynamic GPU slicing and advanced queuing. This will allow the platform to dynamically re-allocate unused GPU resources from batch training jobs to real-time inference workloads, maximizing hardware ROI.

> [!NOTE]
> **KV Cache Optimization**
> We are investigating **LMCache**. By caching and sharing Key-Value (KV) history of system prompts across isolated vLLM engine instances, LMCache can bypass the expensive prompt pre-fill phase, resulting in near-instantaneous response times for multi-turn chats.

> [!TIP]
> **Distributed Inference Serving**
> We are actively tracking **NVIDIA Dynamo**, an open-source, distributed inference-serving framework designed to orchestrate generative AI models at scale. Operating as a cluster-level layer on top of engines like **vLLM** and **TensorRT-LLM**, it coordinates multi-node GPU execution, enables **disaggregated serving** (decoupling the compute-intensive prefill phase from the decode phase across distinct nodes), and utilizes intelligent routing to dispatch queries to nodes holding active KV cache contexts, maximizing throughput and cluster efficiency.
