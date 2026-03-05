"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createFileHub } from "@/lib/signalr/client";
import type { BucketFile } from "@carbonfiles/client";

export function useBucketEvents(bucketId: string, initialFiles: BucketFile[]) {
  const [files, setFiles] = useState<BucketFile[]>(initialFiles);
  const router = useRouter();

  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  useEffect(() => {
    let stopped = false;

    createFileHub().then((hub) => {
      if (stopped) return;

      hub.on("FileCreated", (id: string, file: BucketFile) => {
        if (id === bucketId) {
          setFiles((prev) => [...prev, file]);
          router.refresh();
        }
      });
      hub.on("FileDeleted", (id: string, path: string) => {
        if (id === bucketId) {
          setFiles((prev) => prev.filter((f) => f.path !== path));
          router.refresh();
        }
      });
      hub.on("FileUpdated", (id: string, file: BucketFile) => {
        if (id === bucketId) {
          setFiles((prev) => prev.map((f) => (f.path === file.path ? file : f)));
          router.refresh();
        }
      });

      hub
        .start()
        .then(() => hub.invoke("SubscribeToBucket", bucketId))
        .catch(() => {
          // SignalR connection failed — fall back to static file list
        });

      cleanup = () => {
        hub.stop().catch(() => {});
      };
    });

    let cleanup = () => {};
    return () => {
      stopped = true;
      cleanup();
    };
  }, [bucketId, router]);

  return files;
}
