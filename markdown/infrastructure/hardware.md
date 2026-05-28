# GPU Compute Cluster & Hardware Specs

To host state-of-the-art Open-Source Large Language Models (LLMs) and process voice-to-text workflows locally, the Canton of Basel-Stadt operates high-performance GPU compute clusters. 

The infrastructure is split into an active/redundant pilot deployment (current state) and an enterprise scale-out deployment (future state). Below are the core hardware specifications per server node, focusing on processing cores, system memory, graphics acceleration, and fast local storage.

---

## Core Node Specifications

Below is a direct comparison of the key hardware metrics for both server generations.

| Hardware Metric | Pilot Server Node (Current IST) | Enterprise Server Node (Roadmap SOLL 2026/2027) |
| :--- | :--- | :--- |
| **Server Hardware** | HPE ProLiant DL385 Gen11 | HPE ProLiant DL380a Gen12 |
| **CPU Cores** | 2x AMD EPYC (32 Cores total) | 2x Intel Xeon 6530P (64 Cores total, 2.3 GHz) |
| **System RAM** | 512 GB DDR5 | 2 TB DDR5-6400 |
| **Graphics Processing (GPUs)** | 2x NVIDIA H100 | 2x NVIDIA H200 NVL |
| **GPU VRAM** | 80 GB HBM3 per GPU (160 GB total) | 141 GB HBM3e per GPU (282 GB total) |
| **Local Disk Space** | 2x 480 GB NVMe SSD boot drives | 6x 3.2 TB NVMe Gen4 SSD (19.2 TB local storage) + 2x 480 GB RAID-1 boot drives |


