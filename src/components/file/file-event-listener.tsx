"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createFileHub } from "@/lib/signalr/client";

interface FileEventListenerProps {
  bucketId: string;
  filePath: string;
}

export function FileEventListener({ bucketId, filePath }: FileEventListenerProps) {
  const router = useRouter();

  useEffect(() => {
    let stopped = false;

    createFileHub().then((hub) => {
      if (stopped) return;

      hub.on("FileUpdated", (id: string, file: { path: string }) => {
        if (id === bucketId && file.path === filePath) {
          router.refresh();
        }
      });
      hub.on("FileDeleted", (id: string, path: string) => {
        if (id === bucketId && path === filePath) {
          router.refresh();
        }
      });

      hub
        .start()
        .then(() => hub.invoke("SubscribeToBucket", bucketId))
        .catch(() => {});

      cleanup = () => {
        hub.stop().catch(() => {});
      };
    });

    let cleanup = () => {};
    return () => {
      stopped = true;
      cleanup();
    };
  }, [bucketId, filePath, router]);

  return null;
}
