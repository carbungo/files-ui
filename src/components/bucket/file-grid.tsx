"use client";

import { useState } from "react";
import Link from "next/link";
import { FileIcon } from "@/components/file/file-icon";
import { formatBytes, isTextType } from "@/lib/utils";
import { Play } from "lucide-react";

interface FileEntry {
  path: string;
  name: string;
  size: number;
  mime_type: string;
  short_url?: string | null;
  created_at: string;
  updated_at: string;
}

interface FileGridProps {
  bucketId: string;
  files: FileEntry[];
}

const CODE_EXTENSIONS =
  /\.(rs|go|py|rb|java|kt|swift|c|cpp|h|hpp|cs|fs|hs|ml|ex|exs|clj|scala|zig|nim|ts|tsx|jsx|vue|svelte|astro|css|scss|less|sql|graphql|proto|tf|hcl|yaml|yml|toml|ini|conf|cfg|env|sh|bash|zsh|fish|ps1|bat|cmd|makefile|dockerfile|json|xml|html|md)$/i;

function isImageType(mime: string | undefined) {
  return mime?.startsWith("image/") ?? false;
}

function isVideoType(mime: string | undefined) {
  return mime?.startsWith("video/") ?? false;
}

function isCodeOrText(mime: string | undefined, name: string) {
  return isTextType(mime) || CODE_EXTENSIONS.test(name);
}

function ImageThumbnail({ bucketId, file }: { bucketId: string; file: FileEntry }) {
  const [failed, setFailed] = useState(false);
  const src = `${process.env.NEXT_PUBLIC_API_URL}/api/buckets/${bucketId}/files/${encodeURIComponent(file.path)}/content`;

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface-2">
        <FileIcon mimeType={file.mime_type} size={28} />
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={file.name}
      loading="lazy"
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function VideoThumbnail({ file }: { file: FileEntry }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface-2">
      <div className="relative">
        <FileIcon mimeType={file.mime_type} size={28} />
        <Play
          size={14}
          className="absolute -bottom-1 -right-2 rounded-full bg-bg p-0.5 text-purple-400"
        />
      </div>
    </div>
  );
}

function CodePreview({ file }: { file: FileEntry }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-surface-2 px-2">
      <FileIcon mimeType={file.mime_type} size={24} />
      <div className="w-full space-y-0.5">
        <div className="h-[3px] w-3/4 rounded-full bg-accent/20" />
        <div className="h-[3px] w-full rounded-full bg-text-muted/10" />
        <div className="h-[3px] w-5/6 rounded-full bg-text-muted/10" />
      </div>
    </div>
  );
}

export function FileGrid({ bucketId, files }: FileGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {files.map((file) => {
        const isImage = isImageType(file.mime_type);
        const isVideo = isVideoType(file.mime_type);
        const isCode = isCodeOrText(file.mime_type, file.name);

        return (
          <Link key={file.path} href={`/buckets/${bucketId}/files/${file.path}`}>
            <div className="group flex h-40 flex-col overflow-hidden rounded-lg border border-border bg-surface hover:border-accent transition-colors">
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-t-[inherit] bg-surface-2">
                {isImage ? (
                  <ImageThumbnail bucketId={bucketId} file={file} />
                ) : isVideo ? (
                  <VideoThumbnail file={file} />
                ) : isCode ? (
                  <CodePreview file={file} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FileIcon mimeType={file.mime_type} size={28} />
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center px-2 py-1.5">
                <span className="truncate text-sm leading-tight">{file.name}</span>
                <span className="text-xs text-text-muted">{formatBytes(file.size)}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
