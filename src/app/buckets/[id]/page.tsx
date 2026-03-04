import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { BucketHeader } from "@/components/bucket/bucket-header";
import { ViewModeToggle } from "@/components/bucket/view-mode-toggle";
import { LiveFileList } from "@/components/bucket/live-file-list";
import { ReadmeSection } from "@/components/bucket/readme-section";
import { formatBytes } from "@/lib/utils";

interface BucketFile {
  path: string;
  name: string;
  size: number;
  mime_type: string;
  short_code: string | null;
  short_url: string | null;
  created_at: string;
  updated_at: string;
}

interface BucketDetailResponse {
  id: string;
  name: string;
  owner: string;
  description: string | null;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
  file_count: number;
  total_size: number;
  files: BucketFile[];
  has_more_files: boolean;
}

async function fetchBucket(id: string): Promise<BucketDetailResponse | null> {
  const res = await fetch(`${process.env.API_URL}/api/buckets/${id}`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) return null;
  return res.json() as Promise<BucketDetailResponse>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const bucket = await fetchBucket(id);
  if (!bucket) return { title: "Bucket not found" };
  return {
    title: bucket.name,
    description:
      bucket.description ?? `${bucket.file_count} files, ${formatBytes(bucket.total_size)}`,
  };
}

export default async function BucketPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ path?: string }>;
}) {
  const { id } = await params;
  const { path: currentPath } = await searchParams;
  const bucket = await fetchBucket(id);

  if (!bucket) notFound();

  const cookieStore = await cookies();
  const viewMode = cookieStore.get("cf-view-mode")?.value ?? "list";

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <BucketHeader
        id={bucket.id}
        name={bucket.name}
        description={bucket.description}
        fileCount={bucket.file_count}
        totalSize={bucket.total_size}
        expiresAt={bucket.expires_at}
      />

      <div className="flex justify-end">
        <ViewModeToggle />
      </div>

      <LiveFileList
        bucketId={bucket.id}
        initialFiles={bucket.files}
        hasMoreFiles={bucket.has_more_files}
        fileCount={bucket.file_count}
        viewMode={viewMode === "grid" ? "grid" : "list"}
        currentPath={currentPath ?? ""}
      />

      <ReadmeSection bucketId={bucket.id} files={bucket.files} />
    </main>
  );
}
