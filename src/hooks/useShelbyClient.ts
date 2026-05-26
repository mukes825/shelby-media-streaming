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
      console.error("Failed to load Shelby media items", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlobs();
    
    // Support automatic reload on new additions
    const handleStorageChange = () => {
      const items = ShelbyClient.getBlobs();
      setBlobs(items);
    };

    window.addEventListener("shelby_blobs_changed", handleStorageChange);
    return () => {
      window.removeEventListener("shelby_blobs_changed", handleStorageChange);
    };
  }, [fetchBlobs]);

  const uploadMedia = async (
    file: File,
    description: string,
    senderAddress: string,
    deductBalance: (apt: number, susd: number) => boolean,
    storageCost: number,
    gasCost: number
  ): Promise<BlobItem | null> => {
    setIsUploading(true);
    setUploadProgress(10);
    try {
      // 1. Check & Deduct balances (gas coordination + ShelbyUSD storage allocation)
      const success = deductBalance(gasCost, storageCost);
      if (!success) {
        throw new Error("Insufficient balances for shelbynet storage. Claim test net faucet tokens first.");
      }

      // 2. Perform the upload progress
      const result = await ShelbyClient.uploadBlob(
        file,
        description,
        senderAddress,
        (p) => setUploadProgress(p)
      );

      // 3. Trigger reload
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

  return {
    blobs,
    loading,
    isUploading,
    uploadProgress,
    uploadMedia,
    refresh: fetchBlobs
  };
}
