/**
 * Core Type Definitions for Shelby Media Streaming
 */

export interface BlobItem {
  id: string; // The blobId returned by Shelby
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  senderAddress: string;
  txnHash: string;
  description: string;
  streamUrl: string;
  gasPaid: number;       // APT gas paid
  storageCost: number;  // ShelbyUSD storage deducted
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  publicKey: string | null;
  network: string; // "shelbynet" or other
  status: 'disconnected' | 'connecting' | 'connected' | 'unsupported_network';
}

export interface TokenBalances {
  apt: number;
  susd: number; // ShelbyUSD
}

export type MediaTab = 'all' | 'video' | 'audio' | 'image' | 'document';
