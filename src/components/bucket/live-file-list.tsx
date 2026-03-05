"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useBucketEvents } from "@/hooks/use-bucket-events";
import { FileList } from "./file-list";
import { FileGrid } from "./file-grid";
import type { BucketFile } from "@carbonfiles/client";

interface LiveFileListProps {
  bucketId: string;
  files: BucketFile[];
  folders: string[];
  viewMode: "list" | "grid";
  currentPath: string;
}

function Breadcrumbs({ bucketId, currentPath }: { bucketId: string; currentPath: string }) {
  const segments = currentPath.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1 text-sm text-text-muted mb-3">
      <Link href={`/buckets/${bucketId}`} className="hover:text-text transition-colors">
        root
      </Link>
      {segments.map((segment, i) => {
        const path = segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight size={14} />
            {isLast ? (
              <span className="text-text font-medium">{segment}</span>
            ) : (
              <Link
                href={`/buckets/${bucketId}?path=${encodeURIComponent(path)}`}
                className="hover:text-text transition-colors"
              >
                {segment}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function LiveFileList({
  bucketId,
  files,
  folders,
  viewMode,
  currentPath,
}: LiveFileListProps) {
  // SignalR hook for live updates — triggers router.refresh() to re-fetch /ls
  useBucketEvents(bucketId, files);

  return (
    <div>
      {currentPath && <Breadcrumbs bucketId={bucketId} currentPath={currentPath} />}
      {viewMode === "grid" ? (
        <FileGrid bucketId={bucketId} files={files} folders={folders} currentPath={currentPath} />
      ) : (
        <FileList bucketId={bucketId} files={files} folders={folders} currentPath={currentPath} />
      )}
    </div>
  );
}
