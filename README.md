# AI Continuity

**AI-provider dependency inventory and continuity-gap triage.**

AI Continuity helps an organisation make its reliance on external AI providers explicit: which application depends on which provider/model, which business process is affected, what criticality has been declared, what revenue exposure has been associated with the dependency, and whether a fallback has been recorded and tested.

It is a dependency register and deterministic triage engine. It is not an automated disaster-recovery platform, a provider uptime monitor, a business-impact analysis certification, or proof that a fallback will work.

## Product boundary

### Current API

- `GET /` — service identity and API documentation location.
- `GET /api/health` — process health response.
- `POST /api/analyze` — validate and assess up to 100 declared AI dependencies.
- `GET /docs` — interactive OpenAPI documentation supplied by FastAPI.

Each dependency records application, provider, model, business process, user-declared criticality, annual revenue exposure, and optional fallback details.

### Assessment output

The engine emits:
- A deterministic 0–100 prioritisation index and LOW / MODERATE / HIGH / CRITICAL band.
- Rule-coded findings with severity, points, explanation, evidence status and recommended next action.
- Inventory counts and a scoring-version identifier.

Scoring v1 is a transparent heuristic. Its points are not calibrated against outage history, probabilities, expected loss, customer outcomes or an external standard. Revenue exposure is user-supplied prioritisation context; it is not calculated loss. An empty inventory returns `risk_score: null` and `risk_band: UNKNOWN`, never a perfect score.

## Repository layout

- `app/main.py` — FastAPI request validation and API serialization.
- `app/engine.py` — deterministic rule engine.
- `app/models.py` — domain records.
- `tests/` — API and engine regression tests.
- `frontend/` — Next.js interface.

## Run the API

Python 3.10+:

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Run tests:

```bash
pip install pytest httpx
pytest -q
```

## Run the frontend

```bash
cd frontend
npm ci
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` to the API origin when it differs from the frontend's configured default. Never put private credentials in a `NEXT_PUBLIC_*` variable.

## Security and operational limits

- The API currently has no authentication, tenant isolation, database persistence, audit history, rate limiting, or role-based access control.
- Do not expose it publicly or submit confidential dependency inventories until those controls exist.
- CORS is restricted to the local development origins and the currently configured frontend origin; update the allowlist deliberately for a real deployment.
- The assessment uses declared inputs. It does not independently discover provider dependencies, verify contracts, probe provider status, test failover, or validate revenue attribution.
- A recorded `fallback_validated` flag is user-supplied evidence status, not a test performed by this service.

## Roadmap gates

1. Persist versioned dependency records with tenant isolation and change history.
2. Add evidence attachments and controlled failover-test records.
3. Add provider/model/service mapping and dependency graph views.
4. Add authenticated organisation access, audit logs, retention controls and export.
5. Validate the scoring rubric against documented incident and recovery evidence before using it for material business decisions.
6. Add monitored provider signals only through documented, permissioned integrations.

A feature is not production-ready until its security, recovery, tests and deployment behaviour are verified. No customer, revenue, uptime or risk-reduction claim is made by this repository.
