"use client";

import { useEffect, useState } from "react";
import { createFileHub } from "@/lib/signalr/client";

interface FileEventState {
  deleted: boolean;
  updatedAt?: string;
}

export function useFileEvents(bucketId: string, filePath: string) {
  const [state, setState] = useState<FileEventState>({ deleted: false });

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    const hub = createFileHub(apiUrl);

    hub.on(
      "FileUpdated",
      (id: string, file: { path: string; updated_at: string }) => {
        if (id === bucketId && file.path === filePath) {
          setState({ deleted: false, updatedAt: file.updated_at });
        }
      },
    );
    hub.on("FileDeleted", (id: string, path: string) => {
      if (id === bucketId && path === filePath) {
        setState({ deleted: true });
      }
    });

    hub.start().then(() => hub.invoke("SubscribeToFile", bucketId, filePath));

    return () => {
      hub.stop();
    };
  }, [bucketId, filePath]);

  return state;
}
