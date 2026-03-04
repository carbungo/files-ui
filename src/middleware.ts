import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const apiUrl = process.env.API_URL!;
  const { pathname, search } = request.nextUrl;

  // File content: proxy non-HTML requests to API
  const fileMatch = pathname.match(/^\/buckets\/([^/]+)\/files\/(.+)$/);
  if (fileMatch) {
    const accept = request.headers.get("accept") ?? "";
    if (!accept.includes("text/html")) {
      const [, bucketId, filePath] = fileMatch;
      const target = new URL(
        `/api/buckets/${bucketId}/files/${encodeURIComponent(filePath!)}/content${search}`,
        apiUrl,
      );
      return NextResponse.rewrite(target);
    }
    return NextResponse.next();
  }

  // ZIP download: proxy to API
  const zipMatch = pathname.match(/^\/buckets\/([^/]+)\/zip$/);
  if (zipMatch) {
    const [, bucketId] = zipMatch;
    const target = new URL(`/api/buckets/${bucketId}/zip`, apiUrl);
    return NextResponse.rewrite(target);
  }

  // Upload: proxy to API
  const uploadMatch = pathname.match(/^\/api\/buckets\/([^/]+)\/upload(\/stream)?$/);
  if (uploadMatch) {
    const target = new URL(`${pathname}${search}`, apiUrl);
    return NextResponse.rewrite(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/buckets/:id/files/:path*",
    "/buckets/:id/zip",
    "/api/buckets/:id/upload",
    "/api/buckets/:id/upload/stream",
  ],
};
