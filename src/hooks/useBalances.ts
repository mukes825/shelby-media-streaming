cat > src/hooks/useBalances.ts << 'EOF'
import { useState, useEffect } from 'react';
import { TokenBalances } from '../types';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

const SHELBY_DEVNET = "https://api.shelbynet.shelby.xyz/v1";
const SUSD_FAUCET = "https://faucet.shelbynet.shelby.xyz";
const APT_FAUCET  = "https://faucet.shelbynet.shelby.xyz";

const SUSD_COIN = "0x1b18363a9f1fe5e6ebf247daba5cc1c18052bb232efdc4c50f556053922d98e1::shelby_usd::ShelbyUSD";
const APT_COIN  = "0x1::aptos_coin::AptosCoin";

export function useBalances(walletConnected: boolean, walletAddress: string | null) {
  const { signAndSubmitTransaction } = useWallet();
  const [apt,  setApt]  = useState(0);
  const [susd, setSusd] = useState(0);

  const fetchBalances = async () => {
    if (!walletAddress) return;
    try {
      // APT
      const aptRes = await fetch(
        `${SHELBY_DEVNET}/accounts/${walletAddress}/resource/0x1::coin::CoinStore<${APT_COIN}>`
      );
      if (aptRes.ok) {
        const d = await aptRes.json();
        setApt(parseInt(d?.data?.coin?.value ?? "0") / 1e8);
      }

      // SUSD
      const susdRes = await fetch(
        `${SHELBY_DEVNET}/accounts/${walletAddress}/resource/0x1::coin::CoinStore<${SUSD_COIN}>`
      );
      if (susdRes.ok) {
        const d = await susdRes.json();
        setSusd(parseInt(d?.data?.coin?.value ?? "0") / 1e8);
      }
    } catch (err) {
      console.error("Balance fetch error:", err);
    }
  };

  // Auto-refresh every 6s
  useEffect(() => {
    if (!walletConnected || !walletAddress) { setApt(0); setSusd(0); return; }
    fetchBalances();
    const t = setInterval(fetchBalances, 6000);
    return () => clearInterval(t);
  }, [walletConnected, walletAddress]);

  // Real Shelby Devnet Faucet
  const claimFaucet = async (): Promise<boolean> => {
    if (!walletAddress) return false;
    try {
      // APT faucet
      await fetch(`${APT_FAUCET}/mint?amount=500000000&address=${walletAddress}`, {
        method: "POST"
      });
      // SUSD faucet
      await fetch(`${SUSD_FAUCET}/mint_susd?amount=10000000000&address=${walletAddress}`, {
        method: "POST"
      });
      setTimeout(fetchBalances, 3000);
      return true;
    } catch (err) {
      console.error("Faucet error:", err);
      return false;
    }
  };

  // Real Petra Transaction — APT gas + SUSD storage
  const deduct = async (aptAmount: number, susdAmount: number): Promise<boolean> => {
    if (!walletAddress || !signAndSubmitTransaction) return false;
    try {
      // Transaction 1: APT gas fee (transfer to burn address)
      const aptTx = await signAndSubmitTransaction({
        data: {
          function: "0x1::aptos_account::transfer",
          typeArguments: [],
          functionArguments: [
            "0x000000000000000000000000000000000000000000000000000000000000dead",
            Math.floor(aptAmount * 1e8).toString()
          ]
        }
      });
      console.log("APT gas tx:", aptTx.hash);

      // Transaction 2: SUSD storage cost
      const susdTx = await signAndSubmitTransaction({
        data: {
          function: "0x1::coin::transfer",
          typeArguments: [SUSD_COIN],
          functionArguments: [
            "0x000000000000000000000000000000000000000000000000000000000000dead",
            Math.floor(susdAmount * 1e8).toString()
          ]
        }
      });
      console.log("SUSD storage tx:", susdTx.hash);

      setTimeout(fetchBalances, 3000);
      return true;
    } catch (err: any) {
      console.error("Transaction failed:", err);
      throw new Error(err?.message || "Petra transaction rejected");
    }
  };

  return { apt, susd, claimFaucet, deduct, refresh: fetchBalances };
}
EOF
