import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import './index.css';

const wallets: any[] = []; // In AIP-62 Standard, wallets are auto-detected & injected natively from window.aptos or browser extension.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={true}
      dappConfig={{
        network: "shelbynet" as const,
      }}
      onError={(error) => console.error("Wallet Error:", error)}
    >
      <App />
    </AptosWalletAdapterProvider>
  </React.StrictMode>
);
