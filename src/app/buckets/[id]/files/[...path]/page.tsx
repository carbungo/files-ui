import type { Metadata } from "next";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { TransitionLink } from "@/components/ui/transition-link";
import { FileIcon } from "@/components/file/file-icon";
import { CodeBlock } from "@/components/file/code-block";
import { MarkdownRenderer } from "@/components/file/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { formatBytes, isTextType } from "@/lib/utils";

interface FileMetadata {
  path: string;
  name: string;
  size: number;
  mime_type: string;
  short_code: string | null;
  short_url: string | null;
  created_at: string;
  updated_at: string;
}

const CODE_EXTENSIONS =
  /\.(rs|go|py|rb|java|kt|swift|c|cpp|h|hpp|cs|fs|hs|ml|ex|exs|clj|scala|zig|nim|ts|tsx|jsx|vue|svelte|astro|css|scss|less|sql|graphql|proto|tf|hcl|yaml|yml|toml|ini|conf|cfg|env|sh|bash|zsh|fish|ps1|bat|cmd|makefile|dockerfile)$/i;

type PageParams = { id: string; path: string[] };

async function fetchFileMetadata(bucketId: string, filePath: string): Promise<FileMetadata | null> {
  try {
    const res = await fetch(
      `${process.env.API_URL}/api/buckets/${bucketId}/files/${encodeURIComponent(filePath)}`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    return (await res.json()) as FileMetadata;
  } catch {
    return null;
  }
}

async function fetchFileContent(bucketId: string, filePath: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${process.env.API_URL}/api/buckets/${bucketId}/files/${encodeURIComponent(filePath)}/content`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function isCodeFile(name: string): boolean {
  return CODE_EXTENSIONS.test(name);
}

function getLanguageFromName(name: string): string | undefined {
  const ext = name.split(".").pop()?.toLowerCase();
  if (!ext) return undefined;
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    py: "python",
    rb: "ruby",
    rs: "rust",
    go: "go",
    java: "java",
    kt: "kotlin",
    swift: "swift",
    c: "c",
    cpp: "cpp",
    h: "c",
    hpp: "cpp",
    cs: "csharp",
    fs: "fsharp",
    hs: "haskell",
    ml: "ocaml",
    ex: "elixir",
    exs: "elixir",
    clj: "clojure",
    scala: "scala",
    zig: "zig",
    nim: "nim",
    vue: "vue",
    svelte: "svelte",
    astro: "astro",
    css: "css",
    scss: "scss",
    less: "less",
    sql: "sql",
    graphql: "graphql",
    proto: "protobuf",
    tf: "hcl",
    hcl: "hcl",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    ini: "ini",
    conf: "ini",
    cfg: "ini",
    sh: "bash",
    bash: "bash",
    zsh: "zsh",
    fish: "fish",
    ps1: "powershell",
    bat: "batch",
    cmd: "batch",
    json: "json",
    xml: "xml",
    html: "html",
    md: "markdown",
  };
  return map[ext];
}

function getBasePath(filePath: string): string {
  const parts = filePath.split("/");
  parts.pop();
  return parts.join("/");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { id: bucketId, path: pathSegments } = await params;
  const filePath = pathSegments.join("/");
  const meta = await fetchFileMetadata(bucketId, filePath);
  if (!meta) {
    return { title: "File Not Found" };
  }
  return {
    title: meta.name,
    description: `${formatBytes(meta.size)} - ${meta.mime_type}`,
  };
}

async function FilePreview({
  bucketId,
  filePath,
  metadata,
}: {
  bucketId: string;
  filePath: string;
  metadata: FileMetadata;
}) {
  const contentUrl = `/buckets/${bucketId}/files/${encodeURIComponent(filePath)}`;
  const mimeType = metadata.mime_type;
  const [type] = mimeType.split("/");

  // Markdown files
  if (metadata.name.endsWith(".md") || metadata.name.endsWith(".mdx")) {
    const content = await fetchFileContent(bucketId, filePath);
    if (content !== null) {
      return (
        <MarkdownRenderer content={content} bucketId={bucketId} basePath={getBasePath(filePath)} />
      );
    }
  }

  // Text/code files
  if (isTextType(mimeType) || isCodeFile(metadata.name)) {
    const content = await fetchFileContent(bucketId, filePath);
    if (content !== null) {
      return <CodeBlock code={content} language={getLanguageFromName(metadata.name)} />;
    }
  }

  // Images
  if (type === "image") {
    return (
      <div className="flex min-h-48 justify-center rounded-lg border border-border bg-surface p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={contentUrl}
          alt={metadata.name}
          className="max-h-[600px] max-w-full rounded object-contain"
        />
      </div>
    );
  }

  // Video
  if (type === "video") {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <video controls className="w-full" preload="metadata">
          <source src={contentUrl} type={mimeType} />
          Your browser does not support the video element.
        </video>
      </div>
    );
  }

  // Audio
  if (type === "audio") {
    return (
      <div className="rounded-lg border border-border bg-surface p-6">
        <audio controls className="w-full" preload="metadata">
          <source src={contentUrl} type={mimeType} />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  // PDF
  if (mimeType === "application/pdf") {
    return (
      <div className="overflow-hidden rounded-lg border border-border">
        <iframe src={contentUrl} className="h-[700px] w-full" title={metadata.name} />
      </div>
    );
  }

  // Fallback: download
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-surface p-12 text-center">
      <FileIcon mimeType={mimeType} size={48} />
      <div>
        <p className="text-lg font-medium text-text">{metadata.name}</p>
        <p className="text-sm text-text-muted">{formatBytes(metadata.size)}</p>
      </div>
      <p className="text-sm text-text-muted">No preview available for this file type.</p>
      <a
        href={`${contentUrl}?download=true`}
        className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg hover:bg-accent-2 transition-colors"
      >
        <Download size={16} />
        Download File
      </a>
    </div>
  );
}

export default async function FileDetailPage({ params }: { params: Promise<PageParams> }) {
  const { id: bucketId, path: pathSegments } = await params;
  const filePath = pathSegments.join("/");
  const metadata = await fetchFileMetadata(bucketId, filePath);

  if (!metadata) {
    notFound();
  }

  const downloadUrl = `/buckets/${bucketId}/files/${encodeURIComponent(filePath)}?download=true`;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Back link */}
      <TransitionLink
        direction="back"
        href={`/buckets/${bucketId}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
      >
        <ArrowLeft size={14} />
        Back to bucket
      </TransitionLink>

      {/* File metadata header */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          <ViewTransition name={`file-icon-${filePath}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-2">
              <FileIcon mimeType={metadata.mime_type} size={24} />
            </div>
          </ViewTransition>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold text-text">{metadata.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-muted">
              <span>{formatBytes(metadata.size)}</span>
              <span className="text-border">|</span>
              <Badge>{metadata.mime_type}</Badge>
              {metadata.short_url && (
                <>
                  <span className="text-border">|</span>
                  <a
                    href={metadata.short_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    {metadata.short_url}
                    <ExternalLink size={12} />
                  </a>
                </>
              )}
            </div>
          </div>
          <a
            href={downloadUrl}
            className="inline-flex items-center gap-2 rounded-md bg-surface-2 px-3 py-2 text-sm font-medium text-text border border-border hover:bg-surface transition-colors shrink-0"
          >
            <Download size={16} />
            Download
          </a>
        </div>

        {/* curl snippet */}
        {metadata.short_url && (
          <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface p-3">
            <code className="font-mono text-sm text-text-muted">
              curl -L {metadata.short_url} -o {metadata.name}
            </code>
          </div>
        )}
      </div>

      {/* Preview section */}
      <FilePreview bucketId={bucketId} filePath={filePath} metadata={metadata} />
    </main>
  );
}
