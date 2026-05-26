import { BlobItem } from "../types";
import { generateTxnHash, calculateStoragePrice } from "./aptos";

// Hardcoded real media links for high-fidelity streaming testing
export const INITIAL_BLOBS: BlobItem[] = [
  {
    id: "shelby-blob-vid-01",
    name: "Aqueous_Nexus_Promo.mp4",
    size: 15482390, // ~14.7 MB
    type: "video/mp4",
    uploadedAt: "05/24/2026, 09:14 AM",
    senderAddress: "0xec157dead8623ad5cc50ef55605392d98e155b62",
    txnHash: "0xecad51c1c1fdfae1812bb15fe5e53cc1c1808b23a9a1389a9f1feada5b922d98",
    description: "Official Shelby Hot Storage promotional short. Rendered in full cinematic luxury.",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    gasPaid: 0.0042,
    storageCost: 1.47
  },
  {
    id: "shelby-blob-aud-02",
    name: "Shelby_Synth_Ambient.mp3",
    size: 4718590, // ~4.5 MB
    type: "audio/mp3",
    uploadedAt: "05/25/2026, 02:40 PM",
    senderAddress: "0xb18363a9f1fe5e6ebf247daba5cc1c18052bb232efd",
    txnHash: "0xb7daba5183dbfa51cf0efd4c5c52c1e18052bb232efdc4c50f556053922d98e1",
    description: "Cyberpunk synth ambient soundtrack, perfect for coding on shelbynet.",
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    gasPaid: 0.0038,
    storageCost: 0.45
  },
  {
    id: "shelby-blob-img-03",
    name: "decentralized_vault_concept.png",
    size: 2190182, // ~2.1 MB
    type: "image/png",
    uploadedAt: "05/26/2026, 10:05 AM",
    senderAddress: "0xb18363a9f1fe5e6ebf247daba5cc1c18052bb232efd",
    txnHash: "0x40f5ad57c1a2e9b0532ffc180512fdbc45605f1812bb5bc1c13892d98e11a3b9",
    description: "Artistic conceptual rendering of Shelby Hot Storage architecture.",
    streamUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    gasPaid: 0.0029,
    storageCost: 0.21
  },
  {
    id: "shelby-blob-doc-04",
    name: "Shelby_Whitepaper_v2.pdf",
    size: 1572864, // ~1.5 MB
    type: "application/pdf",
    uploadedAt: "05/26/2026, 11:12 AM",
    senderAddress: "0xca5f18bf22df1812bb15fe5e53cc1c18052bb232efd",
    txnHash: "0x639762681485ff30ba2e53cc1c1805e6ebf247da5cc1c18052bb232efdc4f5ac1",
    description: "Decentralized hot storage technical specs and incentive pool modeling.",
    streamUrl: "https://arxiv.org/pdf/2112.02231.pdf",
    gasPaid: 0.0031,
    storageCost: 0.15
  }
];

export class ShelbyClient {
  /**
   * Get all uploaded blobs across local state + pre-configured items
   */
  static getBlobs(): BlobItem[] {
    const cached = localStorage.getItem("shelby_blobs_v1");
    if (!cached) {
      localStorage.setItem("shelby_blobs_v1", JSON.stringify(INITIAL_BLOBS));
      return INITIAL_BLOBS;
    }
    try {
      return JSON.parse(cached);
    } catch {
      return INITIAL_BLOBS;
    }
  }

  /**
   * Simulates full decentralized storage upload
   */
  static async uploadBlob(
    file: File,
    description: string,
    senderAddress: string,
    onProgress: (progress: number) => void
  ): Promise<BlobItem> {
    const size = file.size;
    const name = file.name;
    const type = file.type || "application/octet-stream";
    const storageCost = calculateStoragePrice(size);
    const gasPaid = parseFloat((0.0015 + Math.random() * 0.0025).toFixed(5));

    // Simulate standard chunk-by-chunk upload latency over Shelby RPC
    for (let progress = 10; progress <= 100; progress += 15) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      onProgress(Math.min(100, progress));
    }

    const blobId = `shelby-blob-${Math.floor(Math.random() * 10000000).toString(16)}`;
    const txnHash = generateTxnHash();
    
    // Create direct fallback asset link for simulation previewing
    let streamUrl = "";
    if (type.startsWith("image/")) {
      streamUrl = URL.createObjectURL(file);
    } else if (type.startsWith("video/")) {
      // Direct stream or sample backup
      streamUrl = URL.createObjectURL(file);
    } else if (type.startsWith("audio/")) {
      streamUrl = URL.createObjectURL(file);
    } else {
      // Standard pdf or other direct fallback
      streamUrl = "https://arxiv.org/pdf/2112.02231.pdf";
    }

    const newBlob: BlobItem = {
      id: blobId,
      name,
      size,
      type,
      uploadedAt: new Date().toLocaleString(),
      senderAddress,
      txnHash,
      description: description || `Uploaded media file via Shelby Client`,
      streamUrl,
      gasPaid,
      storageCost
    };

    // Save to local storage state
    const current = this.getBlobs();
    const updated = [newBlob, ...current];
    localStorage.setItem("shelby_blobs_v1", JSON.stringify(updated));

    return newBlob;
  }
}
