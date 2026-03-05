"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { createApiClient } from "@/lib/api/client";

interface DeleteBucketButtonProps {
  token?: string;
  bucketId: string;
  bucketName: string;
}

export function DeleteBucketButton({ token, bucketId, bucketName }: DeleteBucketButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await createApiClient(token).buckets[bucketId]!.delete();
      router.push("/dashboard/buckets");
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-danger">
          Delete &quot;{bucketName}&quot; and all its files?
        </span>
        <Button variant="danger" onClick={handleDelete} disabled={loading}>
          {loading ? "Deleting..." : "Yes, Delete"}
        </Button>
        <Button variant="ghost" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button variant="danger" onClick={() => setConfirming(true)}>
      <Trash2 size={16} />
      Delete Bucket
    </Button>
  );
}
