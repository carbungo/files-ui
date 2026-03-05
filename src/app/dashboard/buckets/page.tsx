import Link from "next/link";
import { getAuthToken } from "@/lib/auth/cookies";
import { getServerClient } from "@/lib/api/server";
import { CreateBucketForm } from "@/components/dashboard/create-bucket-form";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { formatBytes, formatExpiry } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface BucketsPageProps {
  searchParams: Promise<{ offset?: string; limit?: string }>;
}

export default async function BucketsPage({ searchParams }: BucketsPageProps) {
  const { offset: offsetStr, limit: limitStr } = await searchParams;
  const offset = Number(offsetStr) || 0;
  const limit = Number(limitStr) || 20;
  const token = await getAuthToken();
  const client = await getServerClient();

  let buckets;
  try {
    buckets = await client.buckets.list({ limit, offset, sort: "created_at", order: "desc" });
  } catch {
    buckets = null;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Buckets</h1>
      <CreateBucketForm token={token} />
      {!buckets ? (
        <p className="text-text-muted">Failed to load buckets.</p>
      ) : buckets.items.length === 0 ? (
        <p className="text-text-muted">No buckets yet. Create one above.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Owner</TableHead>
                <TableHead>Files</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="hidden md:table-cell">Expiry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buckets.items.map((bucket) => {
                const isExpired =
                  bucket.expires_at && new Date(bucket.expires_at).getTime() < Date.now();
                return (
                  <TableRow key={bucket.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/buckets/${bucket.id}`}
                        className="font-medium text-link hover:underline"
                      >
                        {bucket.name}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden text-text-muted sm:table-cell">
                      {bucket.owner}
                    </TableCell>
                    <TableCell className="text-text-muted">
                      {bucket.file_count}
                    </TableCell>
                    <TableCell className="text-text-muted">
                      {formatBytes(bucket.total_size)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {bucket.expires_at ? (
                        <Badge variant={isExpired ? "danger" : "default"}>
                          {isExpired ? "Expired" : formatExpiry(bucket.expires_at)}
                        </Badge>
                      ) : (
                        <span className="text-text-muted">Never</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Pagination
            total={buckets.total}
            limit={limit}
            offset={offset}
            baseHref="/dashboard/buckets"
          />
        </>
      )}
    </div>
  );
}
