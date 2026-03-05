"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Save } from "lucide-react";
import { createApiClient, CarbonFilesError } from "@/lib/api/client";

interface EditBucketFormProps {
  token?: string;
  bucketId: string;
  initialName: string;
  initialDescription: string;
}

export function EditBucketForm({ token, bucketId, initialName, initialDescription }: EditBucketFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [expiresIn, setExpiresIn] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await createApiClient(token).buckets[bucketId]!.update({
        name: name.trim() !== initialName ? name.trim() : undefined,
        description: description.trim() !== initialDescription ? (description.trim() || undefined) : undefined,
        expires_in: expiresIn.trim() || undefined,
      });
      setSuccess(true);
      router.refresh();
    } catch (e) {
      if (e instanceof CarbonFilesError) {
        setError(e.error);
      } else {
        setError("Network error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mb-6">
      <h2 className="mb-3 text-lg font-semibold">Edit Bucket</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="edit-name" className="mb-1 block text-sm text-text-muted">
              Name
            </label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="edit-desc" className="mb-1 block text-sm text-text-muted">
              Description
            </label>
            <Input
              id="edit-desc"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="edit-expiry" className="mb-1 block text-sm text-text-muted">
              Extend Expiry
            </label>
            <Input
              id="edit-expiry"
              placeholder="e.g. 24h, 7d"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" variant="primary" disabled={loading}>
          <Save size={16} />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      {success && <p className="mt-2 text-sm text-success">Bucket updated.</p>}
    </Card>
  );
}
