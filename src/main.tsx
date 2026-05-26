import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PetraWallet } from 'petra-plugin-wallet-adapter';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { Network } from '@aptos-labs/ts-sdk';
import App from './App.tsx';
import './index.css';

const wallets = [new PetraWallet()];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true} dappConfig={{ network: Network.TESTNET }}>
      <App />
    </AptosWalletAdapterProvider>
  </StrictMode>,
);
