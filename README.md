# Agricultural Advisory Agent Project

A full-stack agricultural advisory application for Indian farmers. It combines live weather, mandi market records, government-scheme matching, crop guidance, and risk alerts into one authenticated dashboard.

## Features

- User registration, login, protected APIs, and signed access tokens
- Current weather, five-day forecast, and 14-day weather history
- Live mandi market intelligence using the data.gov.in AGMARKNET dataset
- Crop-stage guidance for irrigation, fertiliser, pest management, and general care
- Weather, market, pest, and disease risk alerts
- RAG-based government scheme matching using ChromaDB and sentence-transformers
- Multi-agent advisory workflow with live Server-Sent Events (SSE) status updates
- Advisory reports and dashboard visualisations

## Architecture

```text
React + Vite frontend
        |
        v
FastAPI REST API + authentication
        |
        v
Blackboard orchestration state
        |
        +-- Intake Agent
        +-- Weather Agent
        +-- Market Agent
        +-- Crop Advisory Agent
        +-- Risk Alert Agent
        +-- Scheme Agent (RAG)
        +-- Coordinator Agent
        |
        v
OpenWeatherMap / Open-Meteo / data.gov.in / ChromaDB / SQLite
```

## Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer
- npm
- A data.gov.in API key for live mandi prices

Open-Meteo works without an API key. An OpenWeatherMap key is optional and gives the dashboard OpenWeatherMap current conditions and forecast data.

## Setup

### 1. Configure the backend

Open PowerShell in the project root:

```powershell
cd D:\AgricultureAgentProjectAgenticAi
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
Copy-Item backend\.env.example backend\.env
```

Open `backend/.env` and configure the values:

```ini
DEMO_MODE=false
AUTH_SECRET_KEY=replace_with_a_long_random_secret
DATA_GOV_API_KEY=your_data_gov_in_api_key
WEATHER_API_KEY=your_openweathermap_api_key_optional
OPENAI_API_KEY=your_openai_api_key_optional
```

Generate a secure authentication secret with:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Do not commit `backend/.env`. If a real key was ever committed or shared publicly, revoke or rotate it at the provider immediately.

### 2. Start the backend

```powershell
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API is available at `http://localhost:8000`. Interactive API documentation is available at `http://localhost:8000/docs`.

### 3. Start the frontend

Open a second PowerShell window:

```powershell
cd D:\AgricultureAgentProjectAgenticAi\frontend
npm install
npm run dev
```

Open the URL shown by Vite, normally `http://localhost:5173`.

## First Use

1. Open the frontend in a browser.
2. Register a new user account.
3. Log in.
4. Enter the crop, city, state, and crop growth stage.
5. Generate an advisory and watch the agent status updates.
6. Review weather evidence, market information, risk alerts, and relevant schemes.

## Live Data and Demo Mode

`DEMO_MODE=false` enables live mode.

| Data | Provider | Configuration |
| --- | --- | --- |
| Current weather and five-day forecast | OpenWeatherMap, otherwise Open-Meteo | `WEATHER_API_KEY` optional |
| 14-day weather history | Open-Meteo archive API | No key required |
| Mandi records | data.gov.in AGMARKNET | `DATA_GOV_API_KEY` required |
| Advisory language enhancement | OpenAI | `OPENAI_API_KEY` optional |

In live mode, the application returns a clear error when a required live source is unavailable. It does not intentionally substitute demo data for unavailable live results.

Set `DEMO_MODE=true` only for local demonstrations without external APIs.

## RAG Pipeline

The RAG pipeline currently focuses on government scheme matching:

1. Scheme documents and metadata are added to the retrieval service.
2. In live mode, sentence-transformers creates embeddings.
3. ChromaDB stores the document vectors.
4. The Scheme Agent queries the index with crop, state, and farmer context.
5. Retrieved scheme records are returned with eligibility and relevance information.

If ChromaDB is unavailable, the service falls back to keyword matching from its available in-memory scheme data.

## Agent Workflow

1. **Intake Agent** validates and normalises the farmer request.
2. **Weather Agent** fetches weather data and evaluates weather risk.
3. **Market Agent** fetches market data and identifies a price trend.
4. **Crop Advisory Agent**, **Risk Alert Agent**, and **Scheme Agent** run in parallel.
5. **Coordinator Agent** consolidates the agent outputs into a final advisory report.

The backend uses `asyncio.gather` for parallel agent stages. The frontend receives progress through SSE.

## API Summary

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Authenticate and receive an access token |
| `GET` | `/api/auth/me` | Read the current user |
| `GET` | `/api/weather/current` | Fetch weather for a city and state |
| `POST` | `/api/advisory/generate` | Start an advisory request |
| `GET` | `/api/advisory/{request_id}` | Get advisory state and result |
| `GET` | `/api/advisory/{request_id}/stream` | Stream agent events through SSE |
| `GET` | `/api/market` | Read market intelligence |
| `GET` | `/api/schemes` | Search government schemes |

Most endpoints require the bearer token returned by login.

## Build for Production

```powershell
cd frontend
npm run build
```

The production frontend build is created in `frontend/dist`.

## Project Structure

```text
backend/
  app/
    agents/          Specialist advisory agents
    api/             FastAPI route handlers
    config/          Application settings
    database/        SQLAlchemy models and connection
    orchestration/   Blackboard state and agent orchestrator
    rag/             Embeddings and ChromaDB retrieval
    services/        Weather, market, and LLM integrations
frontend/
  src/
    pages/           Application screens
    components/      Reusable UI components
    hooks/           API and SSE hooks
    services/        HTTP API client
```

## Security Notes

- Keep all keys in `backend/.env`, never in frontend code.
- Keep `backend/.env` out of Git.
- Use a different, long random `AUTH_SECRET_KEY` for each deployment.
- Rotate any API key that was accidentally exposed in a repository, screenshot, or chat.
