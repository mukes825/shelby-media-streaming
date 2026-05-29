import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{
        network: "testnet",
      }}
      onError={(error) => console.error(error)}
    >
      <App />
    </AptosWalletAdapterProvider>
  </React.StrictMode>
);
