import { FolderOpen, FileText, HardDrive, Key, Download } from "lucide-react";
import { getServerClient } from "@/lib/api/server";
import { StatsCard } from "@/components/dashboard/stats-card";
import { formatBytes } from "@/lib/utils";

export default async function DashboardPage() {
  const client = await getServerClient();

  let stats;
  try {
    stats = await client.stats.get();
  } catch {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
        <p className="text-text-muted">Failed to load statistics.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatsCard icon={FolderOpen} label="Buckets" value={stats.total_buckets} />
        <StatsCard icon={FileText} label="Files" value={stats.total_files} />
        <StatsCard
          icon={HardDrive}
          label="Storage"
          value={formatBytes(stats.total_size)}
        />
        <StatsCard icon={Key} label="API Keys" value={stats.total_keys} />
        <StatsCard icon={Download} label="Downloads" value={stats.total_downloads} />
      </div>
    </div>
  );
}
