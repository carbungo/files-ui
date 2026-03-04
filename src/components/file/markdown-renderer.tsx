import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
  bucketId: string;
  basePath?: string;
}

function resolvePath(href: string, basePath: string): string {
  if (href.startsWith("/") || href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }
  // Resolve relative path against basePath
  const parts = basePath.replace(/\/$/, "").split("/").filter(Boolean);
  const hrefParts = href.split("/");
  for (const part of hrefParts) {
    if (part === "..") {
      parts.pop();
    } else if (part !== ".") {
      parts.push(part);
    }
  }
  return parts.join("/");
}

export function MarkdownRenderer({ content, bucketId, basePath = "" }: MarkdownRendererProps) {
  const components: Components = {
    a: ({ href, children, ...props }) => {
      if (
        href &&
        !href.startsWith("http://") &&
        !href.startsWith("https://") &&
        !href.startsWith("#")
      ) {
        const resolved = resolvePath(href, basePath);
        return (
          <a href={`/buckets/${bucketId}/files/${resolved}`} {...props}>
            {children}
          </a>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      );
    },
    img: ({ src, alt, ...props }) => {
      let imgSrc: string | undefined = typeof src === "string" ? src : undefined;
      if (
        imgSrc &&
        !imgSrc.startsWith("http://") &&
        !imgSrc.startsWith("https://") &&
        !imgSrc.startsWith("data:")
      ) {
        const resolved = resolvePath(imgSrc, basePath);
        imgSrc = `/buckets/${bucketId}/files/${encodeURIComponent(resolved)}`;
      }
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={imgSrc} alt={alt ?? ""} {...props} />;
    },
  };

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <div className="prose prose-invert max-w-none text-sm leading-relaxed text-text [&_a]:text-link [&_a:hover]:underline [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_li]:mb-1 [&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_pre]:rounded-lg [&_pre]:bg-surface-2 [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:mb-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-text-muted [&_blockquote]:mb-3 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:bg-surface-2 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_hr]:border-border [&_hr]:my-4 [&_img]:max-w-full [&_img]:rounded">
        <Markdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </Markdown>
      </div>
    </section>
  );
}
