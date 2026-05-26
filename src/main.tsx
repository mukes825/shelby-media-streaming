import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';
import './index.css';

const wallets = [new PetraWallet()];

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={true}
      dappConfig={{
        network: "shelbynet" as const,
        chainId: "shelbynet",
      }}
      onError={(error) => console.error("Wallet Error:", error)}
    >
      <App />
    </AptosWalletAdapterProvider>
  </React.StrictMode>
);
