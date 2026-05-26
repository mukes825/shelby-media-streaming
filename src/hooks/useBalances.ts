import { useState, useEffect } from 'react';
import { TokenBalances } from '../types';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

const APT_STORAGE_KEY = "shelby_bal_apt_v1";
const SUSD_STORAGE_KEY = "shelby_bal_susd_v1";

const DEFAULT_APT = 12.8250;
const DEFAULT_SUSD = 250.00;

export function useBalances(walletConnected: boolean, walletAddress: string | null) {
  const { network } = useWallet();
  const [balances, setBalances] = useState<TokenBalances>(() => {
    const apt = localStorage.getItem(APT_STORAGE_KEY);
    const susd = localStorage.getItem(SUSD_STORAGE_KEY);
    return {
      apt: apt ? parseFloat(apt) : DEFAULT_APT,
      susd: susd ? parseFloat(susd) : DEFAULT_SUSD
    };
  });

  const getFullnodeEndpoint = () => {
    const netName = (network?.name?.toLowerCase()) || localStorage.getItem("shelby_network_v1") || "shelbynet";
    if (netName.includes("testnet")) {
      return "https://fullnode.testnet.aptoslabs.com/v1";
    }
    return "https://api.shelbynet.shelby.xyz/v1";
  };

  useEffect(() => {
    if (!walletConnected || !walletAddress) return;

    let isMounted = true;

    const fetchBalances = async () => {
      const endpoint = getFullnodeEndpoint();
      const aptCoinType = "0x1::aptos_coin::AptosCoin";
      const susdCoinType = "0x1b18363a9f1fe5e6ebf247daba5cc1c18052bb232efdc4c50f556053922d98e1::shelby_usd::ShelbyUSD";

      try {
        // Fetch APT resource
        const aptRes = await fetch(`${endpoint}/accounts/${walletAddress}/resource/0x1::coin::CoinStore<${aptCoinType}>`);
        let fetchedApt = parseFloat(localStorage.getItem(APT_STORAGE_KEY) || String(DEFAULT_APT));
        if (aptRes.ok) {
          const data = await aptRes.ok ? await aptRes.json() : null;
          const val = data?.data?.coin?.value;
          if (val !== undefined) {
            fetchedApt = parseInt(val, 10) / 100000000; // 8 decimals
          }
        }

        // Fetch SUSD resource
        const susdRes = await fetch(`${endpoint}/accounts/${walletAddress}/resource/0x1::coin::CoinStore<${susdCoinType}>`);
        let fetchedSusd = parseFloat(localStorage.getItem(SUSD_STORAGE_KEY) || String(DEFAULT_SUSD));
        if (susdRes.ok) {
          const data = await susdRes.json();
          const val = data?.data?.coin?.value;
          if (val !== undefined) {
            fetchedSusd = parseInt(val, 10) / 100000000; // Assuming 8 decimals for ShelbyUSD
          }
        }

        if (isMounted) {
          setBalances({
            apt: fetchedApt,
            susd: fetchedSusd
          });
          localStorage.setItem(APT_STORAGE_KEY, String(fetchedApt));
          localStorage.setItem(SUSD_STORAGE_KEY, String(fetchedSusd));
        }
      } catch (err) {
        console.error("Failed to fetch on-chain balances:", err);
      }
    };

    fetchBalances();

    const interval = setInterval(() => {
      fetchBalances();
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [walletConnected, walletAddress, network]);

  const claimFaucet = () => {
    // Top up local simulated balances
    const currentApt = parseFloat(localStorage.getItem(APT_STORAGE_KEY) || String(DEFAULT_APT));
    const currentSusd = parseFloat(localStorage.getItem(SUSD_STORAGE_KEY) || String(DEFAULT_SUSD));
    
    const newApt = parseFloat((currentApt + 5.5).toFixed(4));
    const newSusd = parseFloat((currentSusd + 100.0).toFixed(2));
    
    localStorage.setItem(APT_STORAGE_KEY, String(newApt));
    localStorage.setItem(SUSD_STORAGE_KEY, String(newSusd));
    setBalances({ apt: newApt, susd: newSusd });

    // Request on-chain testnet faucet if possible
    if (walletAddress) {
      const endpoint = getFullnodeEndpoint();
      if (endpoint.includes("testnet.aptoslabs.com")) {
        fetch(`https://faucet.testnet.aptoslabs.com/mint?amount=500000000&address=${walletAddress}`, { method: "POST" })
          .then(() => console.log("Testnet active faucet response trigger successful"))
          .catch(err => console.error("Faucet script call failed:", err));
      }
    }
  };

  const deduct = (aptAmount: number, susdAmount: number): boolean => {
    const currentApt = balances.apt;
    const currentSusd = balances.susd;

    if (currentApt < aptAmount || currentSusd < susdAmount) {
      return false; // Insufficient funds
    }

    const newApt = parseFloat((currentApt - aptAmount).toFixed(5));
    const newSusd = parseFloat((currentSusd - susdAmount).toFixed(2));

    localStorage.setItem(APT_STORAGE_KEY, String(newApt));
    localStorage.setItem(SUSD_STORAGE_KEY, String(newSusd));
    setBalances({ apt: newApt, susd: newSusd });
    return true;
  };

  return {
    apt: walletConnected ? balances.apt : 0,
    susd: walletConnected ? balances.susd : 0,
    claimFaucet,
    deduct,
    refresh: () => {
      window.dispatchEvent(new Event("shelby_balance_changed"));
    }
  };
}
