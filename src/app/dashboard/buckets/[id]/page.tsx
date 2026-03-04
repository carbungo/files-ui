import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TransitionLink } from "@/components/ui/transition-link";
import { getAuthToken } from "@/lib/auth/cookies";
import { EditBucketForm } from "@/components/dashboard/edit-bucket-form";
import { DeleteBucketButton } from "@/components/dashboard/delete-bucket-button";
import { FileList } from "@/components/bucket/file-list";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBytes, formatExpiry } from "@/lib/utils";
import type { BucketDetailResponse } from "@/lib/api/client";

interface BucketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BucketDetailPage({ params }: BucketDetailPageProps) {
  const { id } = await params;
  const token = await getAuthToken();

  const res = await fetch(`${process.env.API_URL}/api/buckets/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    notFound();
  }

  const bucket: BucketDetailResponse = await res.json();
  const isExpired = bucket.expires_at && new Date(bucket.expires_at).getTime() < Date.now();

  const files = bucket.files.map((f) => ({
    ...f,
    size: Number(f.size ?? 0),
    created_at: f.created_at ?? "",
    updated_at: f.updated_at ?? "",
  }));

  return (
    <div>
      <TransitionLink
        direction="back"
        href="/dashboard/buckets"
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
      >
        <ArrowLeft size={14} />
        Back to Buckets
      </TransitionLink>

      <Card className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{bucket.name}</h1>
            {bucket.description && <p className="mt-1 text-text-muted">{bucket.description}</p>}
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-text-muted">
              <span>Owner: {bucket.owner}</span>
              <span>Files: {Number(bucket.file_count ?? 0)}</span>
              <span>Size: {formatBytes(Number(bucket.total_size ?? 0))}</span>
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
          <DeleteBucketButton bucketId={bucket.id} bucketName={bucket.name} />
        </div>
      </Card>

      <EditBucketForm
        bucketId={bucket.id}
        initialName={bucket.name}
        initialDescription={bucket.description ?? ""}
      />

      <div>
        <h2 className="mb-3 text-lg font-semibold">Files ({Number(bucket.file_count ?? 0)})</h2>
        {files.length === 0 ? (
          <p className="text-text-muted">No files in this bucket.</p>
        ) : (
          <FileList bucketId={bucket.id} files={files} />
        )}
        {bucket.has_more_files && (
          <p className="mt-2 text-sm text-text-muted">
            Showing first {files.length} files. View the bucket directly for the full list.
          </p>
        )}
      </div>
    </div>
  );
}
