"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const PAGE_SIZE = 200;

async function fetchAllFiles(bucketId: string, startOffset: number): Promise<FileEntry[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const allItems: FileEntry[] = [];
  let offset = startOffset;

  while (true) {
    const res = await fetch(
      `${apiUrl}/api/buckets/${bucketId}/files?limit=${PAGE_SIZE}&offset=${offset}&sort=path&order=asc`,
    );
    if (!res.ok) break;
    const data = (await res.json()) as { items: FileEntry[]; total: number };
    allItems.push(...data.items);
    offset += data.items.length;
    if (offset >= data.total || data.items.length === 0) break;
  }

  return allItems;
}

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
  const [loading, setLoading] = useState(hasMoreFiles);
  const fetchedRef = useRef(false);

  // Auto-load remaining files on mount
  useEffect(() => {
    if (!hasMoreFiles || fetchedRef.current) return;
    fetchedRef.current = true;

    fetchAllFiles(bucketId, initialFiles.length).then((items) => {
      setExtraFiles(items);
      setLoading(false);
    });
  }, [bucketId, hasMoreFiles, initialFiles.length]);

  const allFiles = [...files, ...extraFiles];
  const { folders, directFiles } = groupFilesAtPath(allFiles, currentPath);

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
      {loading && (
        <div className="mt-4 flex justify-center">
          <span className="inline-flex items-center gap-2 text-sm text-text-muted">
            <Loader2 size={14} className="animate-spin" />
            Loading files ({allFiles.length} of {fileCount})...
          </span>
        </div>
      )}
    </div>
  );
}
