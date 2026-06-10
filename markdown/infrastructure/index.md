# AI & Data Infrastructure

Welcome to the documentation for the **Kantonale Daten- und KI-Plattform (KDKP)** — the sovereign data and AI hosting infrastructure of the Canton of Basel-Stadt. 

This section provides externals and developers with a high-level, non-sensitive overview of the hardware, software, and operational methodologies we use to deploy, host, and scale artificial intelligence models and data analytics platforms within a secure public sector environment.

---

## The Vision: Sovereign, Secure, and Private

In the public sector, processing citizen and administrative data demands the highest standards of confidentiality, sovereignty, and trust. Traditional cloud-based AI offerings often require sending data over the internet, risking data leaks and regulatory non-compliance. 

The Canton of Basel-Stadt has resolved this by building a state-of-the-art **on-premise Private Cloud platform**. This setup guarantees:
* **Zero External Data Leakage**: All data processing for AI applications happens entirely within the canton's own secure networks.
* **Data Sovereignty**: Complete ownership and control over data pipelines, storage, and deployed models.
* **High Security & Compliance**: Strict alignment with Swiss cantonal data protection regulations, operating in designated security zones.

---

## Collaborating for Innovation

The platform is designed and maintained as a joint initiative between two major cantonal entities:

```
┌───────────────────────────────────────┐       ┌───────────────────────────────────────┐
│     DCC Data Competence Center        │       │                 IT BS                 │
│         (Statistisches Amt)           │       │       (Central IT Provider)           │
├───────────────────────────────────────┤       ├───────────────────────────────────────┤
│ • Rapid Prototyping (core service)    │       │ • On-Premise Hardware Operations      │
│ • AI Strategy & Competence            │ <───> │ • VMware vSphere Kubernetes (VKS)     │
│ • Teaching & AI Enablement            │       │ • Security Zones & Firewall Controls  │
│ • Model Eval & Reusable Libraries     │       │ • App Operations & Productionization  │
└───────────────────────────────────────┘       └───────────────────────────────────────┘
```

* **DCC Data Competence Center** (part of the **Statistisches Amt**): Focuses on the "innovation and application" layer. The DCC's core focus is rapid prototyping (building pilots such as *TextMate*, *BS-Übersetzer*, and *Transcribo*), teaching across the canton (what AI is, how it can be used, and where it adds value), and enabling the use of AI within existing administrative processes. It also evaluates models and develops reusable frontend and backend software libraries.
* **IT BS**: Focuses on the "infrastructure and operation" layer. IT BS operates the underlying physical hardware, administers the virtualization platform (VMware vSphere Kubernetes Service), manages network zoning and firewall rules, and runs the productive applications — including taking DCC's prototypes from prototype into production. It ensures overall platform stability, reliability, and enterprise-grade SLA monitoring.

---

## Platform Architecture (The 4 Streams)

The KDKP project is structured into four core streams to offer a modular, robust environment:

```mermaid
graph TD
    subgraph user_layer ["User & Workspace Layer"]
        A[Cantonal Administrative Users] --> B[AI Web Apps: TextMate, BS-Übersetzer, Transcribo]
        A --> C[Data Science Workspaces: JupyterHub / R / Python]
    end

    subgraph api_layer ["API & Gateway Layer"]
        B --> D[Tyk.io API Gateway]
    end

    subgraph compute_layer ["Compute & Inference Layer (Stream 2)"]
        D --> F[vLLM Inference Engine]
        D --> G[FasterWhisper & BentoML]
        F --> H[NVIDIA Run:ai Model Serving]
        G --> H
        I[KEDA Event-driven Autoscaler] -.-> H
    end

    subgraph data_layer ["Data & Storage Layer (Stream 1)"]
        H --> J[Stackable Data Platform]
        C --> J
    end

    subgraph virtualization_layer ["Virtualization & Compute Fabric"]
        H --> K[VMware vSphere Kubernetes Service]
        J --> K
        K --> L[NVIDIA GPU Operator]
    end

    subgraph hardware_layer ["Hardware Layer"]
        L --> M[HPE ProLiant GPU Servers: H100 & H200 clusters]
    end

    classDef stream1 fill:#dcfce7,stroke:#166534,stroke-width:1px;
    classDef stream2 fill:#dbeafe,stroke:#1e40af,stroke-width:1px;
    classDef stream3 fill:#fef3c7,stroke:#92400e,stroke-width:1px;
    classDef stream4 fill:#f3e8ff,stroke:#6b21a8,stroke-width:1px;

    class J stream1;
    class F,G,H,I stream2;
    class C stream3;
    class B stream4;
```

### Stream 1: The Data Platform
Managed in partnership with Stackable, this stream provides a modular, open-source data platform. It gives data scientists and AI applications secure, efficient, and audited access to structured and unstructured cantonal databases.

### Stream 2: The AI Platform (GPU Compute & Inference)
This stream is the core engine for local AI. By utilizing advanced GPU hardware and container orchestration, it enables hosting massive Open-Source Large Language Models (LLMs) and other deep learning algorithms completely locally. (See the [Software Stack](/infrastructure/software) page for detail).

### Stream 3: The Collaborative Data Science Environment
Built in partnership with [b-data GmbH](https://www.b-data.io), this environment provides containerized, personal workspaces (using JupyterHub, RStudio, and Python) where data analysts from various departments can securely work together on analytics without copying data locally.

### Stream 4: AI Web Applications
This stream delivers standardized, reusable UI layers, Nuxt/Vue guidelines, and components to accelerate the deployment of user-facing AI applications (e.g., chat interfaces, RAG assistants, translation toolkits).
