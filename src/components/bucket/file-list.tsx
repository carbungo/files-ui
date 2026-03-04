import Link from "next/link";
import { FileIcon } from "@/components/file/file-icon";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { encodeFilePath, formatBytes } from "@/lib/utils";

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
  folders?: string[];
  currentPath?: string;
}

export function FileList({ bucketId, files, folders = [], currentPath = "" }: FileListProps) {
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
        {folders.map((folder) => {
          const folderPath = currentPath ? `${currentPath}/${folder}` : folder;
          return (
            <TableRow key={`folder:${folder}`}>
              <TableCell>
                <FileIcon mimeType="" isDirectory size={16} />
              </TableCell>
              <TableCell>
                <Link
                  href={`/buckets/${bucketId}?path=${encodeURIComponent(folderPath)}`}
                  className="text-link hover:underline truncate block font-medium"
                >
                  {folder}
                </Link>
              </TableCell>
              <TableCell className="text-text-muted">&mdash;</TableCell>
              <TableCell className="text-text-muted hidden sm:table-cell">Folder</TableCell>
              <TableCell className="text-text-muted hidden md:table-cell">&mdash;</TableCell>
            </TableRow>
          );
        })}
        {files.map((file) => (
          <TableRow key={file.path}>
            <TableCell>
              <FileIcon mimeType={file.mime_type} size={16} />
            </TableCell>
            <TableCell>
              <Link
                href={`/buckets/${bucketId}/files/${encodeFilePath(file.path)}`}
                className="text-link hover:underline truncate block"
              >
                {file.name}
              </Link>
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
