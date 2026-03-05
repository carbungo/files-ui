import { FolderOpen, FileText, HardDrive, Key, Download } from "lucide-react";
import { getServerClient } from "@/lib/api/server";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card } from "@/components/ui/card";
import { formatBytes } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export default async function StatsPage() {
  const client = await getServerClient();

  let stats;
  try {
    stats = await client.stats.get();
  } catch {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Stats</h1>
        <p className="text-text-muted">Failed to load statistics.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">System Statistics</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatsCard
          icon={FolderOpen}
          label="Total Buckets"
          value={stats.total_buckets}
        />
        <StatsCard icon={FileText} label="Total Files" value={stats.total_files} />
        <StatsCard
          icon={HardDrive}
          label="Total Storage"
          value={formatBytes(stats.total_size)}
        />
        <StatsCard icon={Key} label="Total API Keys" value={stats.total_keys} />
        <StatsCard
          icon={Download}
          label="Total Downloads"
          value={stats.total_downloads}
        />
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Storage by Owner</h2>
        {stats.storage_by_owner.length === 0 ? (
          <p className="text-text-muted">No data available.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead>Buckets</TableHead>
                <TableHead>Files</TableHead>
                <TableHead>Storage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.storage_by_owner.map((owner) => (
                <TableRow key={owner.owner}>
                  <TableCell className="font-medium">{owner.owner}</TableCell>
                  <TableCell className="text-text-muted">
                    {owner.bucket_count}
                  </TableCell>
                  <TableCell className="text-text-muted">{owner.file_count}</TableCell>
                  <TableCell className="text-text-muted">
                    {formatBytes(owner.total_size)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
