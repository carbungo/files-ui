# CarbonFiles Dashboard

The official web UI for [CarbonFiles](https://github.com/carbungo/carbon-files) — a file-sharing platform with bucket-based organization, API key authentication, and real-time events. Provides a web interface for managing file buckets, uploading and sharing files, and administering API keys.

> For the complete API reference, deployment guide, and LLM-consumable docs, see the [main CarbonFiles repo](https://github.com/carbungo/carbon-files).

## Features

- Dashboard for managing buckets, files, and API keys
- File upload with drag-and-drop support
- Markdown and code file previewing with syntax highlighting
- Short URL redirection for shared files
- Dark/light theme support
- Token-based authentication via the CarbonFiles API

## Quick Start with Docker Compose

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
docker compose up
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Development Setup

### Prerequisites

- Node.js 20+
- npm
- A running CarbonFiles API instance

### Installation

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env.local

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Client Regeneration

The project uses [@hey-api/openapi-ts](https://heyapi.dev/) to generate a typed API client from the CarbonFiles OpenAPI spec. Generated files live in `src/lib/api/generated/` and should not be edited by hand.

To regenerate the client after API changes:

```bash
# Make sure the CarbonFiles API is running locally on port 5239
npm run generate-api
```

This fetches the OpenAPI spec from `http://localhost:5239/openapi/v1.json` and regenerates the TypeScript client, types, and SDK.

## Environment Variables

| Variable              | Description                            | Example                 |
| --------------------- | -------------------------------------- | ----------------------- |
| `API_URL`             | CarbonFiles API base URL (server-side) | `http://localhost:5239` |
| `NEXT_PUBLIC_API_URL` | CarbonFiles API base URL (client-side) | `http://localhost:5239` |
| `AUTH_COOKIE_SECRET`  | Secret used to encrypt the auth cookie | `your-secret-here`      |

## Project Structure

```
src/
  app/          # Next.js App Router pages and API routes
  components/   # React components (ui, bucket, file, dashboard)
  hooks/        # Custom React hooks
  lib/          # Utilities, API client, auth helpers
    api/
      generated/  # Auto-generated API client (do not edit)
      client.ts   # Client-side API configuration
      server.ts   # Server-side API configuration
```

## Tech Stack

- [Next.js 16](https://nextjs.org/) with App Router
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [@hey-api/openapi-ts](https://heyapi.dev/) for API client generation
- [Shiki](https://shiki.style/) for syntax highlighting
- [Lucide](https://lucide.dev/) for icons

## Deployment

The project is configured for standalone output (`output: "standalone"` in `next.config.ts`), making it suitable for containerized deployments. Build and run with:

```bash
npm run build
npm run start
```

Or use the provided Dockerfile for container-based deployments.
