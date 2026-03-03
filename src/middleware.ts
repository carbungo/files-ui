import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const accept = request.headers.get("accept") ?? "";
  const { pathname } = request.nextUrl;
  const fileMatch = pathname.match(/^\/buckets\/([^/]+)\/files\/(.+)$/);
  if (fileMatch && !accept.includes("text/html")) {
    const [, bucketId, filePath] = fileMatch;
    const apiUrl = process.env.API_URL!;
    return NextResponse.redirect(
      `${apiUrl}/api/buckets/${bucketId}/files/${encodeURIComponent(filePath!)}/content`,
      { status: 302 }
    );
  }
  return NextResponse.next();
}

export const config = { matcher: ["/buckets/:id/files/:path*"] };
