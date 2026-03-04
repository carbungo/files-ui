import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code: string;
  language?: string;
  maxLines?: number;
}

export async function CodeBlock({ code, language, maxLines = 50 }: CodeBlockProps) {
  const lines = code.split("\n");
  const truncated = lines.slice(0, maxLines).join("\n");
  const hasMore = lines.length > maxLines;

  const html = await codeToHtml(truncated, {
    lang: language ?? "text",
    theme: "github-dark-default",
  });

  return (
    <div className="rounded-lg border border-border bg-surface">
      <div
        className="[&_pre]:!bg-transparent [&_pre]:overflow-x-auto [&_pre]:p-4 [&_pre]:text-sm [&_pre]:leading-relaxed [&_code]:font-mono"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {hasMore && (
        <div className="border-t border-border bg-surface-2 px-4 py-2 text-center text-sm text-text-muted">
          {lines.length - maxLines} more lines
        </div>
      )}
    </div>
  );
}
