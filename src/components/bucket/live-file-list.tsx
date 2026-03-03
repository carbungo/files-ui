"use client";

import { useBucketEvents } from "@/hooks/use-bucket-events";
import { FileList } from "./file-list";
import { FileGrid } from "./file-grid";

interface LiveFileListProps {
  bucketId: string;
  initialFiles: Array<{
    path: string;
    name: string;
    size: number;
    mime_type: string;
    short_code?: string | null;
    short_url?: string | null;
    created_at: string;
    updated_at: string;
  }>;
  viewMode: "list" | "grid";
}

export function LiveFileList({
  bucketId,
  initialFiles,
  viewMode,
}: LiveFileListProps) {
  const files = useBucketEvents(bucketId, initialFiles);

  if (viewMode === "grid") {
    return <FileGrid bucketId={bucketId} files={files} />;
  }
  return <FileList bucketId={bucketId} files={files} />;
}
