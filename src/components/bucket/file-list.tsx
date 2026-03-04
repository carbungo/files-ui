import { ViewTransition } from "react";
import { FileIcon } from "@/components/file/file-icon";
import { TransitionLink } from "@/components/ui/transition-link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatBytes } from "@/lib/utils";

interface FileEntry {
  path: string;
  name: string;
  size: number;
  mime_type: string;
  short_url?: string | null;
  created_at: string;
  updated_at: string;
}

interface FileListProps {
  bucketId: string;
  files: FileEntry[];
}

export function FileList({ bucketId, files }: FileListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">{""}</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="w-24">Size</TableHead>
          <TableHead className="w-40 hidden sm:table-cell">Type</TableHead>
          <TableHead className="w-40 hidden md:table-cell">Modified</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => (
          <TableRow key={file.path}>
            <TableCell>
              <ViewTransition name={`file-icon-${file.path}`}>
                <FileIcon mimeType={file.mime_type} size={16} />
              </ViewTransition>
            </TableCell>
            <TableCell>
              <TransitionLink
                direction="forward"
                href={`/buckets/${bucketId}/files/${file.path}`}
                className="text-link hover:underline truncate block"
              >
                {file.name}
              </TransitionLink>
            </TableCell>
            <TableCell className="text-text-muted whitespace-nowrap">
              {formatBytes(file.size)}
            </TableCell>
            <TableCell className="text-text-muted hidden sm:table-cell truncate max-w-40">
              {file.mime_type}
            </TableCell>
            <TableCell className="text-text-muted hidden md:table-cell whitespace-nowrap">
              {new Date(file.updated_at).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
