import { useState, useEffect } from 'react';

export function useNetworkValidation(initialConnected: boolean) {
  const [currentNetwork, setCurrentNetwork] = useState<string>(() => {
    return localStorage.getItem("shelby_network_v1") || "shelbynet";
  });

  const isCorrectNetwork = currentNetwork === "shelbynet";

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
    currentNetwork,
    isCorrectNetwork,
    changeNetwork,
    targetNetwork: "shelbynet",
  };
}
