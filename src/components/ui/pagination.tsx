import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
  baseHref: string;
}

export function Pagination({ total, limit, offset, baseHref }: PaginationProps) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const prevOffset = Math.max(0, offset - limit);
  const nextOffset = offset + limit;
  const hasPrev = offset > 0;
  const hasNext = nextOffset < total;
  const separator = baseHref.includes("?") ? "&" : "?";

  return (
    <nav className="flex items-center justify-center gap-2 py-4" aria-label="Pagination">
      {hasPrev ? (
        <Link href={`${baseHref}${separator}offset=${prevOffset}&limit=${limit}`} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface-2">
          <ChevronLeft size={14} /> Previous
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm opacity-50">
          <ChevronLeft size={14} /> Previous
        </span>
      )}
      <span className="text-sm text-text-muted">Page {currentPage} of {totalPages}</span>
      {hasNext ? (
        <Link href={`${baseHref}${separator}offset=${nextOffset}&limit=${limit}`} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface-2">
          Next <ChevronRight size={14} />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm opacity-50">
          Next <ChevronRight size={14} />
        </span>
      )}
    </nav>
  );
}
