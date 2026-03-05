import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import {
  CarbonFilesClient,
  type BucketDetailResponse,
  type DirectoryListingResponse,
} from "@carbonfiles/client";
import { BucketHeader } from "@/components/bucket/bucket-header";
import { ViewModeToggle } from "@/components/bucket/view-mode-toggle";
import { LiveFileList } from "@/components/bucket/live-file-list";
import { ReadmeSection } from "@/components/bucket/readme-section";
import { formatBytes } from "@/lib/utils";

function getClient() {
  return new CarbonFilesClient({ baseUrl: process.env.API_URL! });
}

async function fetchBucket(id: string): Promise<BucketDetailResponse | null> {
  try {
    return await getClient().buckets[id]!.get();
  } catch {
    return null;
  }
}

async function fetchDirectoryListing(
  id: string,
  path: string,
): Promise<DirectoryListingResponse | null> {
  try {
    return await getClient().buckets[id]!.files.listDirectory(path, {
      limit: 200,
      sort: "name",
      order: "asc",
    });
  } catch {
    return null;
  }
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

  const listing = await fetchDirectoryListing(id, currentPath ?? "");

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
        files={listing?.files ?? []}
        folders={listing?.folders ?? []}
        viewMode={viewMode === "grid" ? "grid" : "list"}
        currentPath={currentPath ?? ""}
      />

      <ReadmeSection bucketId={bucket.id} files={listing?.files ?? []} />
    </main>
  );
}
