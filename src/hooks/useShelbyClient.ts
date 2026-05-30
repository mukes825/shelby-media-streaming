cat > src/hooks/useShelbyClient.ts << 'EOF'
import { useState, useCallback, useEffect } from 'react';
import { BlobItem } from '../types';
import { ShelbyClient } from '../lib/shelby';

export function useShelbyClient() {
  const [blobs, setBlobs] = useState<BlobItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const fetchBlobs = useCallback(() => {
    setLoading(true);
    try {
      const items = ShelbyClient.getBlobs();
      setBlobs(items);
    } catch (e) {
      console.error("Failed to load blobs", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlobs();
    const handler = () => setBlobs(ShelbyClient.getBlobs());
    window.addEventListener("shelby_blobs_changed", handler);
    return () => window.removeEventListener("shelby_blobs_changed", handler);
  }, [fetchBlobs]);

  const uploadMedia = async (
    file: File,
    description: string,
    senderAddress: string,
    deductBalance: (apt: number, susd: number) => Promise<boolean>,
    storageCost: number,
    gasCost: number
  ): Promise<BlobItem | null> => {
    setIsUploading(true);
    setUploadProgress(10);
    try {
      // Real Petra transactions — APT gas + SUSD storage
      const success = await deductBalance(gasCost, storageCost);
      if (!success) {
        throw new Error("Transaction failed or rejected in Petra.");
      }

      const result = await ShelbyClient.uploadBlob(
        file, description, senderAddress,
        (p) => setUploadProgress(p)
      );

      fetchBlobs();
      window.dispatchEvent(new Event("shelby_blobs_changed"));
      return result;
    } catch (e: any) {
      console.error(e);
      throw e;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return { blobs, loading, isUploading, uploadProgress, uploadMedia, refresh: fetchBlobs };
}
EOF
