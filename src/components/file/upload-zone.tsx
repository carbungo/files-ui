"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";

type FileStatus = "idle" | "uploading" | "success" | "error";

interface TrackedFile {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  error?: string;
  abort?: AbortController;
}

interface UploadZoneProps {
  bucketId: string;
  uploadToken?: string;
  proxyUrl?: string;
}

const STREAMING_THRESHOLD = 100 * 1024 * 1024; // 100MB

export function UploadZone({ bucketId, uploadToken, proxyUrl }: UploadZoneProps) {
  const [files, setFiles] = useState<TrackedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";

  const getUploadUrl = useCallback(
    (file: File) => {
      if (file.size > STREAMING_THRESHOLD) {
        // Streaming upload via PUT
        const encodedName = encodeURIComponent(file.name);
        if (proxyUrl) {
          return `${proxyUrl}/stream?filename=${encodedName}`;
        }
        const base = `${apiBase}/api/buckets/${bucketId}/upload/stream?filename=${encodedName}`;
        return uploadToken ? `${base}&token=${uploadToken}` : base;
      }
      // Multipart upload via POST
      if (proxyUrl) {
        return proxyUrl;
      }
      const base = `${apiBase}/api/buckets/${bucketId}/upload`;
      return uploadToken ? `${base}?token=${uploadToken}` : base;
    },
    [apiBase, bucketId, uploadToken, proxyUrl],
  );

  const uploadFile = useCallback(
    (tracked: TrackedFile) => {
      const controller = new AbortController();
      const xhr = new XMLHttpRequest();
      const url = getUploadUrl(tracked.file);
      const isStreaming = tracked.file.size > STREAMING_THRESHOLD;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === tracked.id
            ? { ...f, status: "uploading" as const, progress: 0, abort: controller }
            : f,
        ),
      );

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setFiles((prev) => prev.map((f) => (f.id === tracked.id ? { ...f, progress } : f)));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === tracked.id ? { ...f, status: "success" as const, progress: 100 } : f,
            ),
          );
        } else {
          let errorMsg = `Upload failed (${xhr.status})`;
          try {
            const body = JSON.parse(xhr.responseText);
            if (body.error) errorMsg = body.error;
          } catch {
            // keep default error
          }
          setFiles((prev) =>
            prev.map((f) =>
              f.id === tracked.id ? { ...f, status: "error" as const, error: errorMsg } : f,
            ),
          );
        }
      });

      xhr.addEventListener("error", () => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === tracked.id ? { ...f, status: "error" as const, error: "Network error" } : f,
          ),
        );
      });

      xhr.addEventListener("abort", () => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === tracked.id ? { ...f, status: "error" as const, error: "Cancelled" } : f,
          ),
        );
      });

      controller.signal.addEventListener("abort", () => {
        xhr.abort();
      });

      if (isStreaming) {
        xhr.open("PUT", url);
        xhr.setRequestHeader("Content-Type", tracked.file.type || "application/octet-stream");
        xhr.send(tracked.file);
      } else {
        xhr.open("POST", url);
        const formData = new FormData();
        formData.append("file", tracked.file);
        xhr.send(formData);
      }
    },
    [getUploadUrl],
  );

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const additions: TrackedFile[] = Array.from(newFiles).map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        status: "idle" as const,
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...additions]);

      // Start uploading each file immediately
      for (const tracked of additions) {
        uploadFile(tracked);
      }
    },
    [uploadFile],
  );

  const cancelFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.abort) {
        file.abort.abort();
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const retryFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const file = prev.find((f) => f.id === id);
        if (file) {
          uploadFile(file);
        }
        return prev;
      });
    },
    [uploadFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
        e.target.value = "";
      }
    },
    [addFiles],
  );

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors duration-150 ${
          dragOver
            ? "border-accent bg-accent/10 text-accent"
            : "border-border text-text-muted hover:border-accent/50 hover:text-text"
        }`}
      >
        <Upload size={32} />
        <div className="text-center">
          <p className="text-sm font-medium">Drop files here or click to browse</p>
          <p className="mt-1 text-xs text-text-muted">
            Files over 100 MB will use streaming upload
          </p>
        </div>
      </div>

      <input ref={inputRef} type="file" multiple onChange={handleInputChange} className="hidden" />

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((tracked) => (
            <div
              key={tracked.id}
              className="flex items-center gap-3 rounded-md border border-border bg-surface p-3"
            >
              {/* Status icon */}
              <div className="shrink-0">
                {tracked.status === "uploading" && (
                  <Loader2 size={16} className="animate-spin text-accent" />
                )}
                {tracked.status === "success" && <CheckCircle size={16} className="text-success" />}
                {tracked.status === "error" && <AlertCircle size={16} className="text-danger" />}
                {tracked.status === "idle" && <Upload size={16} className="text-text-muted" />}
              </div>

              {/* File info and progress */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{tracked.file.name}</p>
                  <span className="shrink-0 text-xs text-text-muted">
                    {formatBytes(tracked.file.size)}
                  </span>
                </div>

                {tracked.status === "uploading" && (
                  <div className="mt-1.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-200"
                        style={{ width: `${tracked.progress}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-text-muted">{tracked.progress}%</p>
                  </div>
                )}

                {tracked.status === "error" && tracked.error && (
                  <p className="mt-0.5 text-xs text-danger">{tracked.error}</p>
                )}
              </div>

              {/* Actions */}
              <div className="shrink-0">
                {tracked.status === "uploading" && (
                  <Button
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelFile(tracked.id);
                    }}
                    aria-label="Cancel upload"
                  >
                    <X size={14} />
                  </Button>
                )}
                {tracked.status === "error" && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        retryFile(tracked.id);
                      }}
                    >
                      Retry
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelFile(tracked.id);
                      }}
                      aria-label="Remove"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                )}
                {tracked.status === "success" && (
                  <Button
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelFile(tracked.id);
                    }}
                    aria-label="Remove"
                  >
                    <X size={14} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
