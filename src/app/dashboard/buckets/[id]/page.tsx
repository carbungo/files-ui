import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAuthToken } from "@/lib/auth/cookies";
import { getServerClient } from "@/lib/api/server";
import { EditBucketForm } from "@/components/dashboard/edit-bucket-form";
import { DeleteBucketButton } from "@/components/dashboard/delete-bucket-button";
import { FileList } from "@/components/bucket/file-list";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBytes, formatExpiry } from "@/lib/utils";

interface BucketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BucketDetailPage({ params }: BucketDetailPageProps) {
  const { id } = await params;
  const token = await getAuthToken();
  const client = await getServerClient();

  let bucket;
  try {
    bucket = await client.buckets[id]!.get();
  } catch {
    notFound();
  }

  let files: import("@carbonfiles/client").BucketFile[] = [];
  try {
    const listing = await client.buckets[id]!.files.list({
      limit: 200,
      sort: "name",
      order: "asc",
    });
    files = listing.items;
  } catch {
    // keep empty
  }

  const isExpired = bucket.expires_at && new Date(bucket.expires_at).getTime() < Date.now();

  return (
    <div>
      <Link
        href="/dashboard/buckets"
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
      >
        <ArrowLeft size={14} />
        Back to Buckets
      </Link>

      <Card className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{bucket.name}</h1>
            {bucket.description && <p className="mt-1 text-text-muted">{bucket.description}</p>}
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-text-muted">
              <span>Owner: {bucket.owner}</span>
              <span>Files: {bucket.file_count}</span>
              <span>Size: {formatBytes(bucket.total_size)}</span>
              {bucket.created_at && (
                <span>Created: {new Date(bucket.created_at).toLocaleDateString()}</span>
              )}
              {bucket.expires_at && (
                <Badge variant={isExpired ? "danger" : "default"}>
                  {isExpired ? "Expired" : formatExpiry(bucket.expires_at)}
                </Badge>
              )}
            </div>
          </div>
          <DeleteBucketButton bucketId={bucket.id} bucketName={bucket.name} token={token} />
        </div>
      </Card>

      <EditBucketForm
        bucketId={bucket.id}
        initialName={bucket.name}
        initialDescription={bucket.description ?? ""}
        token={token}
      />

      <div>
        <h2 className="mb-3 text-lg font-semibold">Files ({bucket.file_count})</h2>
        {files.length === 0 ? (
          <p className="text-text-muted">No files in this bucket.</p>
        ) : (
          <FileList bucketId={bucket.id} files={files} />
        )}
      </div>
    </div>
  );
}
