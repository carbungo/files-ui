"use client";

import { useEffect, useState } from "react";
import { createFileHub } from "@/lib/signalr/client";

interface BucketFile {
  path: string;
  name: string;
  size: number;
  mime_type: string;
  short_code?: string | null;
  short_url?: string | null;
  created_at: string;
  updated_at: string;
}

export function useBucketEvents(bucketId: string, initialFiles: BucketFile[]) {
  const [files, setFiles] = useState<BucketFile[]>(initialFiles);

  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    const hub = createFileHub(apiUrl);

    hub.on("FileCreated", (id: string, file: BucketFile) => {
      if (id === bucketId) setFiles((prev) => [...prev, file]);
    });
    hub.on("FileDeleted", (id: string, path: string) => {
      if (id === bucketId)
        setFiles((prev) => prev.filter((f) => f.path !== path));
    });
    hub.on("FileUpdated", (id: string, file: BucketFile) => {
      if (id === bucketId)
        setFiles((prev) =>
          prev.map((f) => (f.path === file.path ? file : f)),
        );
    });

    hub.start().then(() => hub.invoke("SubscribeToBucket", bucketId));

    return () => {
      hub.stop();
    };
  }, [bucketId]);

  return files;
}
