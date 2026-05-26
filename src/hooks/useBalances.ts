import { useState, useEffect } from 'react';
import { TokenBalances } from '../types';

const APT_STORAGE_KEY = "shelby_bal_apt_v1";
const SUSD_STORAGE_KEY = "shelby_bal_susd_v1";

const DEFAULT_APT = 12.8250;
const DEFAULT_SUSD = 250.00;

export function useBalances(walletConnected: boolean, walletAddress: string | null) {
  const [balances, setBalances] = useState<TokenBalances>(() => {
    const apt = localStorage.getItem(APT_STORAGE_KEY);
    const susd = localStorage.getItem(SUSD_STORAGE_KEY);
    return {
      apt: apt ? parseFloat(apt) : DEFAULT_APT,
      susd: susd ? parseFloat(susd) : DEFAULT_SUSD
    };
  });

  // Keep state updated when storage changes or on a poll interval
  useEffect(() => {
    const handleBalanceUpdate = () => {
      const apt = localStorage.getItem(APT_STORAGE_KEY);
      const susd = localStorage.getItem(SUSD_STORAGE_KEY);
      setBalances({
        apt: apt ? parseFloat(apt) : DEFAULT_APT,
        susd: susd ? parseFloat(susd) : DEFAULT_SUSD
      });
    };

    window.addEventListener("shelby_balance_changed", handleBalanceUpdate);
    
    // Poll every 5s as requested by user ("Real-time APT + ShelbyUSD balance (refresh every 5s)")
    const interval = setInterval(() => {
      if (walletConnected) {
        // Minor natural fluctuations or sync checks helper
        handleBalanceUpdate();
      }
    }, 5000);

    return () => {
      window.removeEventListener("shelby_balance_changed", handleBalanceUpdate);
      clearInterval(interval);
    };
  }, [walletConnected]);

  const claimFaucet = () => {
    const currentApt = parseFloat(localStorage.getItem(APT_STORAGE_KEY) || String(DEFAULT_APT));
    const currentSusd = parseFloat(localStorage.getItem(SUSD_STORAGE_KEY) || String(DEFAULT_SUSD));
    
    const newApt = parseFloat((currentApt + 5.0).toFixed(4));
    const newSusd = parseFloat((currentSusd + 100.0).toFixed(2));
    
    localStorage.setItem(APT_STORAGE_KEY, String(newApt));
    localStorage.setItem(SUSD_STORAGE_KEY, String(newSusd));
    
    window.dispatchEvent(new Event("shelby_balance_changed"));
  };

  const deduct = (aptAmount: number, susdAmount: number): boolean => {
    const currentApt = parseFloat(localStorage.getItem(APT_STORAGE_KEY) || String(DEFAULT_APT));
    const currentSusd = parseFloat(localStorage.getItem(SUSD_STORAGE_KEY) || String(DEFAULT_SUSD));

    if (currentApt < aptAmount || currentSusd < susdAmount) {
      return false; // Insufficient funds
    }

    const newApt = parseFloat((currentApt - aptAmount).toFixed(5));
    const newSusd = parseFloat((currentSusd - susdAmount).toFixed(2));

    localStorage.setItem(APT_STORAGE_KEY, String(newApt));
    localStorage.setItem(SUSD_STORAGE_KEY, String(newSusd));

    window.dispatchEvent(new Event("shelby_balance_changed"));
    return true;
  };

  return {
    apt: walletConnected ? balances.apt : 0,
    susd: walletConnected ? balances.susd : 0,
    claimFaucet,
    deduct,
    refresh: () => window.dispatchEvent(new Event("shelby_balance_changed"))
  };
}
