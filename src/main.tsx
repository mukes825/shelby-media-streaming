import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import {
  AptosWalletAdapterProvider,
} from "@aptos-labs/wallet-adapter-react";

import {
  PetraWallet,
} from "@aptos-labs/wallet-adapter-wallets";

const wallets = [new PetraWallet()];

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={true}
      dappConfig={{
        network: "testnet" as const,
      }}
      onError={(error) => console.error(error)}
    >
      <App />
    </AptosWalletAdapterProvider>
  </React.StrictMode>
);
