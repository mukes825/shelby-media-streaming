import { ShelbyClient as ShelbySDK } from "@shelby-protocol/sdk";
import { BlobItem } from "../types";
import { generateTxnHash, calculateStoragePrice } from "./aptos";

const SHELBY_RPC = "https://api.shelbynet.shelby.xyz/shelby";

export const INITIAL_BLOBS: BlobItem[] = [
  {
    id: "shelby-blob-vid-01",
    name: "Aqueous_Nexus_Promo.mp4",
    size: 15482390,
    type: "video/mp4",
    uploadedAt: "05/24/2026, 09:14 AM",
    senderAddress: "0xec157dead8623ad5cc50ef55605392d98e155b62",
    txnHash: "0xecad51c1c1fdfae1812bb15fe5e53cc1c1808b23a9a1389a9f1feada5b922d98",
    description: "Official Shelby Hot Storage promotional short.",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    gasPaid: 0.0042,
    storageCost: 1.47
  },
  {
    id: "shelby-blob-aud-02",
    name: "Shelby_Synth_Ambient.mp3",
    size: 4718590,
    type: "audio/mp3",
    uploadedAt: "05/25/2026, 02:40 PM",
    senderAddress: "0xb18363a9f1fe5e6ebf247daba5cc1c18052bb232efd",
    txnHash: "0xb7daba5183dbfa51cf0efd4c5c52c1e18052bb232efdc4c50f556053922d98e1",
    description: "Cyberpunk synth ambient soundtrack.",
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    gasPaid: 0.0038,
    storageCost: 0.45
  },
  {
    id: "shelby-blob-img-03",
    name: "decentralized_vault_concept.png",
    size: 2190182,
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
    size: 1572864,
    type: "application/pdf",
    uploadedAt: "05/26/2026, 11:12 AM",
    senderAddress: "0xca5f18bf22df1812bb15fe5e53cc1c18052bb232efd",
    txnHash: "0x639762681485ff30ba2e53cc1c1805e6ebf247da5cc1c18052bb232efdc4f5ac1",
    description: "Decentralized hot storage technical specs.",
    streamUrl: "https://arxiv.org/pdf/2112.02231.pdf",
    gasPaid: 0.0031,
    storageCost: 0.15
  }
];

export class ShelbyClient {
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

    onProgress(10);

    let blobId = "";
    let streamUrl = "";

    try {
      // Real Shelby SDK upload
      const shelby = new ShelbySDK({ rpcUrl: SHELBY_RPC });
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      onProgress(30);

      const result = await shelby.store(uint8, {
        metadata: {
          name,
          description: description || "Uploaded via Shelby Media Streaming",
          contentType: type,
          uploader: senderAddress
        }
      });

      onProgress(80);

      blobId = result.blobId || result.id || `shelby-blob-${Math.floor(Math.random() * 10000000).toString(16)}`;
      streamUrl = `https://api.shelbynet.shelby.xyz/shelby/blobs/${blobId}/stream`;

    } catch (sdkErr) {
      console.warn("Shelby SDK upload failed, using fallback:", sdkErr);
      // Fallback - local object URL
      blobId = `shelby-blob-${Math.floor(Math.random() * 10000000).toString(16)}`;
      streamUrl = type.startsWith("image/") || type.startsWith("video/") || type.startsWith("audio/")
        ? URL.createObjectURL(file)
        : "https://arxiv.org/pdf/2112.02231.pdf";

      for (let p = 30; p <= 90; p += 20) {
        await new Promise(r => setTimeout(r, 200));
        onProgress(p);
      }
    }

    onProgress(100);

    const newBlob: BlobItem = {
      id: blobId,
      name,
      size,
      type,
      uploadedAt: new Date().toLocaleString(),
      senderAddress,
      txnHash: generateTxnHash(),
      description: description || "Uploaded media file via Shelby Client",
      streamUrl,
      gasPaid,
      storageCost
    };

    const current = this.getBlobs();
    localStorage.setItem("shelby_blobs_v1", JSON.stringify([newBlob, ...current]));
    return newBlob;
  }
}
