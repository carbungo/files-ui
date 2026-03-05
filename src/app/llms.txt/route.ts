import { NextResponse } from "next/server";

const content = `# CarbonFiles Dashboard

> Official web UI for CarbonFiles — the file-sharing platform with bucket-based organization.
> For the complete API reference, see the carbon-files repo: https://github.com/carbungo/carbon-files/blob/main/llms.txt

## What This Is

The dashboard is a Next.js frontend for the CarbonFiles API. It provides a web interface for browsing buckets, previewing files (with syntax highlighting, video players, image previews), managing API keys, and uploading files.

The API backend is the source of truth for all operations. This dashboard is a consumer of that API.

## Routes

| Route | Auth | Description |
|-------|------|-------------|
| \`/\` | Public | Landing page — enter a bucket ID or log in |
| \`/?token={jwt}\` | — | Auto-login: validates token, sets cookie, redirects to /dashboard |
| \`/dashboard\` | Dashboard token | Admin dashboard — bucket list, stats overview |
| \`/dashboard/buckets/{id}\` | Dashboard token | Bucket detail — file list, management, upload |
| \`/dashboard/keys\` | Dashboard token | API key management — create, list, revoke |
| \`/dashboard/stats\` | Dashboard token | System statistics |
| \`/buckets/{id}\` | Public | Public bucket view — browse files, download |
| \`/buckets/{id}/files/{path}\` | Public | File detail — preview with syntax highlighting, video player, etc. |
| \`/buckets/{id}/upload?token={token}\` | Upload token | Upload page — drag-and-drop file upload |
| \`/auth/set-token\` | — | API route: validates JWT via API, sets \`cf-auth-token\` cookie |
| \`/api/version\` | Public | Build info (commit, timestamp) |

## Authentication Flow

1. An admin creates a dashboard token: \`POST /api/tokens/dashboard\` on the CarbonFiles API
2. User visits \`https://{dashboard}/?token={jwt}\`
3. Dashboard calls \`/auth/set-token\` which validates the JWT against the API (\`GET /api/tokens/dashboard/me\`)
4. On success, sets an HTTP-only cookie \`cf-auth-token={jwt}\`
5. Redirects to \`/dashboard\`
6. All subsequent requests use the cookie for auth — both browser-side API calls and server-side rendering

## URL Conventions

- **Dashboard URLs** (for humans): \`https://{dashboard}/buckets/{id}\`, \`https://{dashboard}/buckets/{id}/files/{path}\`
  These render a nice UI with previews, syntax highlighting, video players, download buttons.
- **API URLs** (for code): \`https://{api}/api/buckets/{id}/files/{path}/content\`
  These return raw file bytes — for curl, scripts, SDKs.
- **Short URLs** (for sharing): \`https://{api}/s/{code}\`
  302 redirect to raw file content. Good for embedding, sharing in chat.
- The dashboard and API may be on different subdomains (e.g., \`dash.example.com\` vs \`files.example.com\`).
- When generating links for chat messages, docs, or anywhere a human will click: use dashboard URLs.
- When generating links for curl, scripts, CI/CD: use API URLs or short URLs.

## Environment Variables

| Variable | Description |
|----------|-------------|
| \`NEXT_PUBLIC_API_URL\` | Public API URL that browsers call (e.g., \`https://files.example.com\`) |
| \`API_URL\` | Internal API URL for server-side rendering (e.g., \`http://api:8080\`) |
| \`AUTH_COOKIE_SECRET\` | Secret for encrypting the auth cookie |
| \`PORT\` | Dashboard port (default: 3000) |

## Tech Stack

Next.js 16 (App Router), React 19, Tailwind CSS 4, Bun runtime.
API client auto-generated from OpenAPI spec via @hey-api/openapi-ts.
Shiki for syntax highlighting, Lucide for icons.

## Deployment

See the CarbonFiles deployment guide: https://github.com/carbungo/carbon-files/blob/main/docs/DEPLOYMENT.md
`;

export function GET() {
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
