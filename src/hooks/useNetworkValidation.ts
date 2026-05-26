import { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

export function useNetworkValidation(initialConnected: boolean) {
  const { network, connected } = useWallet();
  const [currentNetwork, setCurrentNetwork] = useState<string>(() => {
    return localStorage.getItem("shelby_network_v1") || "shelbynet";
  });

  const activeWalletNetwork = network?.name?.toLowerCase() || "";

  // Support Petra wallet properly on testnet and custom shelbynet network.
  const isCorrectNetwork = connected
    ? (activeWalletNetwork.includes("testnet") || activeWalletNetwork.includes("shelbynet") || activeWalletNetwork.includes("devnet") || activeWalletNetwork.includes("custom"))
    : (currentNetwork === "shelbynet" || currentNetwork === "aptos_devnet");

  useEffect(() => {
    if (connected && network?.name) {
      setCurrentNetwork(network.name.toLowerCase());
    }
  }, [connected, network]);

  const changeNetwork = (networkName: string) => {
    localStorage.setItem("shelby_network_v1", networkName);
    setCurrentNetwork(networkName);
    window.dispatchEvent(new Event("shelby_network_changed"));
  };

  useEffect(() => {
    const handleNetworkChange = () => {
      const net = localStorage.getItem("shelby_network_v1") || "shelbynet";
      setCurrentNetwork(net);
    };

    window.addEventListener("shelby_network_changed", handleNetworkChange);
    return () => {
      window.removeEventListener("shelby_network_changed", handleNetworkChange);
    };
  }, []);

  return {
    currentNetwork: connected && network?.name ? network.name.toLowerCase() : currentNetwork,
    isCorrectNetwork,
    changeNetwork,
    targetNetwork: "shelbynet",
  };
}
