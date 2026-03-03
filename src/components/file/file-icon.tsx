import {
  File, FileText, FileCode, Image as FileImage, Video, Music,
  Archive, FileSpreadsheet, FileType, Folder,
} from "lucide-react";

interface FileIconProps {
  mimeType: string;
  isDirectory?: boolean;
  className?: string;
  size?: number;
}

export function FileIcon({ mimeType, isDirectory, className = "", size = 16 }: FileIconProps) {
  if (isDirectory) return <Folder size={size} className={`text-accent-2 ${className}`} />;

  const [type, subtype] = mimeType.split("/");

  if (type === "image") return <FileImage size={size} className={`${className}`} />;
  if (type === "video") return <Video size={size} className={`text-purple-400 ${className}`} />;
  if (type === "audio") return <Music size={size} className={`text-yellow-400 ${className}`} />;

  if (mimeType === "application/pdf") return <FileType size={size} className={`text-red-400 ${className}`} />;
  if (mimeType === "application/zip" || mimeType === "application/gzip" || mimeType === "application/x-tar")
    return <Archive size={size} className={`text-orange-400 ${className}`} />;
  if (subtype?.includes("json") || subtype?.includes("xml") || subtype?.includes("csv"))
    return <FileSpreadsheet size={size} className={`text-blue-400 ${className}`} />;

  if (type === "text" || mimeType === "application/javascript" || mimeType === "application/typescript")
    return <FileCode size={size} className={`text-accent ${className}`} />;

  return <File size={size} className={`text-text-muted ${className}`} />;
}
