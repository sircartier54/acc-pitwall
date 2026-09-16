# acc-pitwall

> A real-time pit-wall strategy & telemetry dashboard for **Assetto Corsa Competizione (ACC)**, built with Python, WebSockets, and Angular.

## Overview
`acc-pitwall` connects to ACC's telemetry stream (UDP Broadcasting / Shared Memory) to provide live timing boards, stint monitoring, and predictive fuel strategy calculations for endurance racing.

Designed with a decoupled client-server architecture:
- **Backend (Python / FastAPI):** Ingests raw UDP telemetry packets, decodes binary payloads, and broadcasts structured events over WebSockets.
- **Frontend (Angular):** Renders high-frequency timing towers, delta metrics, and pit windows using Angular Signals and reactive streams.

## System Architecture

```text
[ ACC Simulator / UDP Replay ]
             │ (UDP Packets @ 20-60 Hz)
             ▼
[ Ingestion Service (FastAPI) ]
             │ (Local WebSockets)
             ▼
[ Pit-Wall Dashboard (Angular) ]
