import { useState, useEffect, useRef } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

const SHELBY_RPC = "https://api.shelbynet.staging.aptoslabs.com/v1";
const APT_FAUCET_URL = "https://faucet.shelbynet.shelby.xyz/fund?asset=apt";
const SUSD_FAUCET_URL = "https://faucet.shelbynet.shelby.xyz/fund?asset=shelbyusd";
const SUSD_COIN = "0x1b18363a9f1fe5e6ebf247daba5cc1c18052bb232efdc4c50f556053922d98e1::shelby_usd::ShelbyUSD";
const APT_COIN = "0x1::aptos_coin::AptosCoin";
const SUSD_METADATA = "0x1b18363a9f1fe5e6ebf247daba5cc1c18052bb232efdc4c50f556053922d98e1";

export function useBalances(walletConnected: boolean, walletAddress: string | null) {
  const { signAndSubmitTransaction } = useWallet();
  const [apt, setApt] = useState(0);
  const [susd, setSusd] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Store address ko ref mein rakhte hain — wallet ke saath tied
  const storeRef = useRef<{ address: string; wallet: string } | null>(null);

  const getSusdStore = async (wallet: string): Promise<string | null> => {
    // Agar same wallet ka store already cached hai toh reuse karo
    if (storeRef.current?.wallet === wallet) {
      return storeRef.current.address;
    }
    try {
      const res = await fetch(`${SHELBY_RPC}/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          function: "0x1::primary_fungible_store::primary_store_address",
          type_arguments: ["0x1::fungible_asset::Metadata"],
          arguments: [wallet, SUSD_METADATA]
        })
      });
      if (!res.ok) return null;
      const data = await res.json();
      const store = data?.[0];
      if (store) {
        // Cache karo
        storeRef.current = { address: store, wallet };
        console.log("✅ SUSD Store cached:", store);
      }
      return store || null;
    } catch {
      return null;
    }
  };

  const fetchBalances = async () => {
    if (!walletAddress) return;
    setIsLoading(true);
    try {
      // APT fetch
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
        const aptVal = parseInt(d[0] ?? "0") / 1e8;
        setApt(aptVal);
        console.log("✅ APT:", aptVal);
      }

      // SUSD fetch — correct store address se
      const store = await getSusdStore(walletAddress);
      if (store) {
        const susdRes = await fetch(
          `${SHELBY_RPC}/accounts/${store}/resource/0x1::fungible_asset::FungibleStore`
        );
        if (susdRes.ok) {
          const d = await susdRes.json();
          const susdVal = parseInt(d.data?.balance ?? "0") / 1e8;
          setSusd(susdVal);
          console.log("✅ SUSD:", susdVal, "from store:", store);
        }
      }
    } catch (err) {
      console.error("Balance fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!walletConnected || !walletAddress) {
      setApt(0);
      setSusd(0);
      storeRef.current = null;
      return;
    }
    fetchBalances();
    const t = setInterval(fetchBalances, 30000);
    return () => clearInterval(t);
  }, [walletConnected, walletAddress]);

  const claimFaucet = async (): Promise<boolean> => {
    if (!walletAddress) return false;
    try {
      const r1 = await fetch(APT_FAUCET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: walletAddress, amount: 500000000 })
      });
      console.log("APT faucet:", r1.status);

      await new Promise(r => setTimeout(r, 2000));

      const r2 = await fetch(SUSD_FAUCET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: walletAddress, amount: 1000000000 })
      });
      console.log("SUSD faucet:", r2.status);

      await new Promise(r => setTimeout(r, 4000));
      await fetchBalances();
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
      console.log("APT tx:", aptTx.hash);

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
      console.log("SUSD tx:", susdTx.hash);

      await new Promise(r => setTimeout(r, 3000));
      await fetchBalances();
      return true;
    } catch (err: any) {
      console.error("Transaction failed:", err);
      throw new Error(err?.message || "Petra transaction rejected");
    }
  };

  return {
    apt,
    susd,
    aptBalance: { data: apt, isLoading, isRefetching: false },
    shelbyUSDBalance: { data: susd, isLoading, isRefetching: false },
    claimFaucet,
    deduct,
    refresh: fetchBalances,
  };
}
