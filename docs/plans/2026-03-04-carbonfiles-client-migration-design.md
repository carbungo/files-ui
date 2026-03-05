# Migration to @carbonfiles/client

Replace generated API client (`@hey-api/openapi-ts`) with the handcrafted `@carbonfiles/client` package. Remove proxy route handlers — client components hit the API directly.

## Architecture

**Server-side** (`src/lib/api/server.ts`): `getServerClient()` reads the httpOnly `cf-auth-token` cookie and returns a `CarbonFilesClient` instance.

**Client-side** (`src/lib/api/client.ts`): Exports `createApiClient(token?)` helper. Dashboard client components receive the token as a prop from their parent server page.

**Public pages**: Create `CarbonFilesClient` without auth — public endpoints don't require it.

## Key Decisions

1. **No proxy routes** — Client components call the API directly via `@carbonfiles/client`. CORS assumed configured on the API.
2. **Token as prop** — Dashboard server pages pass auth token to client components. Simple, no context provider needed.
3. **Upload zone** — Replace XHR with `@carbonfiles/client` upload (has `onProgress` + `signal` support). Falls back to creating a client per-upload.
4. **Content URLs** — File preview pages still construct raw URLs for `<img src>`, `<video src>`, `<iframe src>` — these need browser-fetchable URLs, not SDK responses.

## Changes

### Create/Rewrite
- `src/lib/api/server.ts` — CarbonFilesClient from cookies
- `src/lib/api/client.ts` — re-exports + createApiClient helper

### Update Server Pages
- `src/app/dashboard/page.tsx` — `client.stats.get()`
- `src/app/dashboard/stats/page.tsx` — `client.stats.get()`
- `src/app/dashboard/keys/page.tsx` — `client.keys.list()`, pass token
- `src/app/dashboard/buckets/page.tsx` — `client.buckets.list()`, pass token
- `src/app/dashboard/buckets/[id]/page.tsx` — `client.buckets[id].get()`, pass token
- `src/app/buckets/[id]/page.tsx` — public client, `files.listDirectory()`
- `src/app/buckets/[id]/files/[...path]/page.tsx` — public client for metadata

### Update Client Components (receive token prop, call API directly)
- `src/components/dashboard/create-bucket-form.tsx`
- `src/components/dashboard/edit-bucket-form.tsx`
- `src/components/dashboard/create-key-form.tsx`
- `src/components/dashboard/delete-key-button.tsx`
- `src/components/dashboard/delete-bucket-button.tsx`
- `src/components/file/upload-zone.tsx`

### Update Types Only
- `src/hooks/use-bucket-events.ts` — import BucketFile from @carbonfiles/client
- `src/app/auth/set-token/route.ts` — use client for token validation

### Delete
- `src/lib/api/generated/` (entire directory)
- `openapi-ts.config.ts`
- `src/app/dashboard/buckets/create/route.ts`
- `src/app/dashboard/buckets/[id]/edit/route.ts`
- `src/app/dashboard/buckets/[id]/delete/route.ts`
- `src/app/dashboard/buckets/[id]/upload/route.ts`
- `src/app/dashboard/keys/create/route.ts`
- `src/app/dashboard/keys/[prefix]/delete/route.ts`

### Cleanup
- Remove `@hey-api/openapi-ts` from devDependencies
- Remove `generate-api` script from package.json
