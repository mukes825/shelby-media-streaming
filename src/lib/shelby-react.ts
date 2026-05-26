import { useState } from 'react';
import { ShelbyClient } from './shelby';
import { BlobItem } from '../types';

export function useUploadBlob() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const uploadBlob = async (
    file: File,
    description: string,
    senderAddress: string
  ): Promise<BlobItem> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    try {
      const result = await ShelbyClient.uploadBlob(file, description, senderAddress, (p) => {
        setProgress(p);
      });
      return result;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadBlob,
    isUploading,
    progress,
    error,
  };
}
