import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { UploadZone } from "@/components/file/upload-zone";

export const metadata: Metadata = {
  title: "Upload Files",
  robots: { index: false, follow: false },
};

export default async function UploadTokenPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto max-w-md rounded-lg border border-danger/50 bg-surface p-6 text-center">
          <h1 className="text-lg font-semibold text-danger">Missing Upload Token</h1>
          <p className="mt-2 text-sm text-text-muted">
            An upload token is required to upload files. Please use a valid upload link.
          </p>
        </div>
      </div>
    );
  }

  // Verify bucket exists
  const res = await fetch(`${process.env.API_URL}/api/buckets/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    notFound();
  }

  const bucket = await res.json();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Upload Files</h1>
        <p className="mt-1 text-sm text-text-muted">
          Uploading to <span className="font-medium text-text">{bucket.name}</span>
        </p>
      </div>
      <UploadZone bucketId={id} uploadToken={token} />
    </div>
  );
}
