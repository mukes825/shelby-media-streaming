import { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

const SHELBY_FULLNODE = "https://api.shelbynet.staging.aptoslabs.com/v1";
const APT_FAUCET = "https://faucet.shelbynet.shelby.xyz/fund?asset=apt";
const SUSD_FAUCET = "https://faucet.shelbynet.shelby.xyz/fund?asset=shelbyusd";
const APT_COIN_TYPE = "0x1::aptos_coin::AptosCoin";
const SUSD_COIN_TYPE = "0x1b18363a9f1fe5e6ebf247daba5cc1c18052bb232efdc4c50f556053922d98e1::shelby_usd::ShelbyUSD";

export function useBalances(walletConnected: boolean, walletAddress: string | null) {
  const { network } = useWallet();
  const [apt, setApt] = useState<number>(0);
  const [susd, setSusd] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchBalances = async () => {
    if (!walletConnected || !walletAddress) {
      setApt(0);
      setSusd(0);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const aptRes = await fetch(
        `${SHELBY_FULLNODE}/accounts/${walletAddress}/resource/0x1::coin::CoinStore<${APT_COIN_TYPE}>`
      );
      if (aptRes.ok) {
        const data = await aptRes.json();
        const val = data?.data?.coin?.value;
        if (val !== undefined) {
          const aptAmount = parseInt(val, 10) / 100000000;
          setApt(aptAmount);
          console.log("APT Balance:", aptAmount);
        }
      } else {
        console.log("APT fetch status:", aptRes.status);
        setApt(0);
      }

      const susdRes = await fetch(
        `${SHELBY_FULLNODE}/accounts/${walletAddress}/resource/0x1::coin::CoinStore<${SUSD_COIN_TYPE}>`
      );
      if (susdRes.ok) {
        const data = await susdRes.json();
        const val = data?.data?.coin?.value;
        if (val !== undefined) {
          const susdAmount = parseInt(val, 10) / 100000000;
          setSusd(susdAmount);
          console.log("SUSD Balance:", susdAmount);
        }
      } else {
        console.log("SUSD fetch status:", susdRes.status);
        setSusd(0);
      }
    } catch (err) {
      console.error("Balance fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (walletConnected && walletAddress) {
      fetchBalances();
    }
  }, [walletConnected, walletAddress, network]);

  useEffect(() => {
    if (!walletConnected || !walletAddress) return;
    const interval = setInterval(fetchBalances, 8000);
    return () => clearInterval(interval);
  }, [walletConnected, walletAddress]);

  const claimFaucet = async () => {
    if (!walletAddress) return;
    try {
      const r1 = await fetch(APT_FAUCET, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: walletAddress, amount: 100000000 }),
      });
      console.log("APT Faucet status:", r1.status);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const r2 = await fetch(SUSD_FAUCET, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: walletAddress, amount: 1000000000 }),
      });
      console.log("SUSD Faucet status:", r2.status);

      await new Promise(resolve => setTimeout(resolve, 3000));
      await fetchBalances();

    } catch (err) {
      console.error("Faucet failed:", err);
    }
  };

  const deduct = (aptAmount: number, susdAmount: number): boolean => {
    console.log("Deduct check — APT:", apt, "need:", aptAmount, "SUSD:", susd, "need:", susdAmount);
    if (apt < aptAmount || susd < susdAmount) {
      return false;
    }
    setTimeout(fetchBalances, 3000);
    return true;
  };

  return {
    apt,
    susd,
    aptBalance: {
      data: apt,
      isLoading,
      isRefetching: false,
    },
    shelbyUSDBalance: {
      data: susd,
      isLoading,
      isRefetching: false,
    },
    claimFaucet,
    deduct,
    refresh: fetchBalances,
  };
}
