# AI Continuity frontend

The web interface maps AI applications to their providers, models, business processes, revenue exposure and fallback arrangements. It submits the dependency inventory to the AI Continuity API and renders the resulting continuity score and risk findings.

## Requirements

- Node.js 22
- npm
- A reachable AI Continuity API instance

## Local setup

```sh
cp .env.example .env.local
npm ci
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` to the base URL of the API. The default points to the configured hosted API. The value is public browser configuration; never place secrets, access tokens or private credentials in it.

## Quality checks

```sh
npm run lint
npm run build
```

## Deployment

Configure `NEXT_PUBLIC_API_URL` in the frontend hosting provider before building. Next.js embeds public environment variables into the client bundle at build time, so changing the value requires a new build and deployment.

The API must allow browser requests from the deployed frontend origin. A successful frontend build does not prove API reachability; verify the health endpoint and submit a representative analysis after deployment.
