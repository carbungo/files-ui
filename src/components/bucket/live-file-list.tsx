"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";
import { useBucketEvents } from "@/hooks/use-bucket-events";
import { FileList } from "./file-list";
import { FileGrid } from "./file-grid";

interface FileEntry {
  path: string;
  name: string;
  size: number;
  mime_type: string;
  short_code?: string | null;
  short_url?: string | null;
  created_at: string;
  updated_at: string;
}

interface LiveFileListProps {
  bucketId: string;
  initialFiles: FileEntry[];
  hasMoreFiles: boolean;
  fileCount: number;
  viewMode: "list" | "grid";
  currentPath: string;
}

function groupFilesAtPath(files: FileEntry[], currentPath: string) {
  const prefix = currentPath ? currentPath + "/" : "";
  const folderSet = new Set<string>();
  const directFiles: FileEntry[] = [];

  for (const file of files) {
    if (prefix && !file.path.startsWith(prefix)) continue;

    const relativePath = prefix ? file.path.slice(prefix.length) : file.path;
    const slashIndex = relativePath.indexOf("/");

    if (slashIndex === -1) {
      directFiles.push(file);
    } else {
      folderSet.add(relativePath.slice(0, slashIndex));
    }
  }

  return { folders: [...folderSet].sort(), directFiles };
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

const PAGE_SIZE = 100;

export function LiveFileList({
  bucketId,
  initialFiles,
  hasMoreFiles,
  fileCount,
  viewMode,
  currentPath,
}: LiveFileListProps) {
  const files = useBucketEvents(bucketId, initialFiles);
  const [extraFiles, setExtraFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(!hasMoreFiles);

  const allFiles = [...files, ...extraFiles];
  const { folders, directFiles } = groupFilesAtPath(allFiles, currentPath);

  const loadMore = useCallback(async () => {
    setLoading(true);
    try {
      const offset = allFiles.length;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(
        `${apiUrl}/api/buckets/${bucketId}/files?limit=${PAGE_SIZE}&offset=${offset}&sort=path&order=asc`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as { items: FileEntry[]; total: number };
      setExtraFiles((prev) => [...prev, ...data.items]);
      if (offset + data.items.length >= data.total) {
        setExhausted(true);
      }
    } finally {
      setLoading(false);
    }
  }, [allFiles.length, bucketId]);

  return (
    <div>
      {currentPath && <Breadcrumbs bucketId={bucketId} currentPath={currentPath} />}
      {viewMode === "grid" ? (
        <FileGrid
          bucketId={bucketId}
          files={directFiles}
          folders={folders}
          currentPath={currentPath}
        />
      ) : (
        <FileList
          bucketId={bucketId}
          files={directFiles}
          folders={folders}
          currentPath={currentPath}
        />
      )}
      {!exhausted && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-surface-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Loading...
              </>
            ) : (
              `Load more (${allFiles.length} of ${fileCount})`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
