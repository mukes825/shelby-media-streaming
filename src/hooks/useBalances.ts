import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

const SHELBY_RPC = "https://api.shelbynet.staging.aptoslabs.com/v1";
const SUSD_STORE = "0xfb0fae7b415bb74529abada8bccad88d42885a3a30bb646c241fb18a520b0459";
const APT_FAUCET_URL = "https://faucet.shelbynet.shelby.xyz/fund?asset=apt";
const SUSD_FAUCET_URL = "https://faucet.shelbynet.shelby.xyz/fund?asset=shelbyusd";
const SUSD_COIN = "0x1b18363a9f1fe5e6ebf247daba5cc1c18052bb232efdc4c50f556053922d98e1::shelby_usd::ShelbyUSD";
const APT_COIN = "0x1::aptos_coin::AptosCoin";

export function useBalances(walletConnected: boolean, walletAddress: string | null) {
  const { signAndSubmitTransaction } = useWallet();
  const [apt, setApt] = useState(0);
  const [susd, setSusd] = useState(0);

  const fetchBalances = async () => {
    if (!walletAddress) return;
    try {
      // APT balance
      const aptRes = await fetch(`${SHELBY_RPC}/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          function: "0x1::coin::balance",
          type_arguments: [APT_COIN],
          arguments: [walletAddress]
        })
      });
      if (aptRes.ok) {
        const d = await aptRes.json();
        setApt(parseInt(d[0] ?? "0") / 1e8);
      } else {
        setApt(0);
      }

      // SUSD — direct FungibleStore address se
      const susdRes = await fetch(
        `${SHELBY_RPC}/accounts/${SUSD_STORE}/resource/0x1::fungible_asset::FungibleStore`
      );
      if (susdRes.ok) {
        const d = await susdRes.json();
        setSusd(parseInt(d.data?.balance ?? "0") / 1e8);
      } else {
        setSusd(0);
      }
    } catch (err) {
      console.error("Balance fetch error:", err);
    }
  };

  useEffect(() => {
    if (!walletConnected || !walletAddress) {
      setApt(0);
      setSusd(0);
      return;
    }
    fetchBalances();
    const t = setInterval(fetchBalances, 6000);
    return () => clearInterval(t);
  }, [walletConnected, walletAddress]);

  const claimFaucet = async (): Promise<boolean> => {
    if (!walletAddress) return false;
    try {
      const aptRes = await fetch(APT_FAUCET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: walletAddress, amount: 500000000 })
      });
      console.log("APT faucet:", aptRes.status);
      const susdRes = await fetch(SUSD_FAUCET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: walletAddress, amount: 1000000000 })
      });
      console.log("SUSD faucet:", susdRes.status);
      setTimeout(fetchBalances, 3000);
      return true;
    } catch (err) {
      console.error("Faucet error:", err);
      return false;
    }
  };

  const deduct = async (aptAmount: number, susdAmount: number): Promise<boolean> => {
    if (!walletAddress || !signAndSubmitTransaction) return false;
    try {
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
