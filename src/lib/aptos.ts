/**
 * Verified Aptos and shelbynet parameters
 */

export const APT_COIN_TYPE = "0x1::aptos_coin::AptosCoin";
export const SHELBY_USD_COIN_TYPE = "0x1b18363a9f1fe5e6ebf247daba5cc1c18052bb232efdc4c50f556053922d98e1::shelby_usd::ShelbyUSD";

export const SHELBYNET_CONFIG = {
  networkName: "shelbynet" as const,
  fullnode: "https://api.shelbynet.shelby.xyz/v1",
  indexer: "https://api.shelbynet.shelby.xyz/v1/graphql",
  rpcUrl: "https://api.shelbynet.shelby.xyz/shelby",
  explorerUrl: "https://explorer.shelby.xyz/shelbynet"
};

/**
 * Utility: Shorten Aptos address for elegant UI display
 */
export function truncateAddress(address: string | null): string {
  if (!address) return "";
  const clean = address.startsWith("0x") ? address : `0x${address}`;
  return `${clean.slice(0, 6)}...${clean.slice(-4)}`;
}

/**
 * Utility: Calculate storage deduction in ShelbyUSD based on byte size.
 * Let's assume standard pricing: 0.1 ShelbyUSD per megabyte (with a minimum of 0.01 ShelbyUSD).
 */
export function calculateStoragePrice(bytes: number): number {
  const mb = bytes / (1024 * 1024);
  const cost = mb * 0.10; // $0.10 per MB
  return Math.max(0.01, parseFloat(cost.toFixed(4)));
}

/**
 * Utility: Generate a random simulated 32-byte Aptos transaction hash
 */
export function generateTxnHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}
