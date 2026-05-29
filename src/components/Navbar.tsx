import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Globe, Coins, ShieldAlert, Sparkles, Check, HelpCircle, LogOut } from 'lucide-react';
import { truncateAddress } from '../lib/aptos';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

interface NavbarProps {
  walletConnected: boolean;
  walletAddress: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  currentNetwork: string;
  onNetworkChange: (net: string) => void;
  onClaimFaucet: () => void;
  aptBalance: number;
  susdBalance: number;
}

export default function Navbar({
  walletConnected,
  walletAddress,
  onConnect,
  onDisconnect,
  currentNetwork,
  onNetworkChange,
  onClaimFaucet,
  aptBalance,
  susdBalance
}: NavbarProps) {
  const { connected, disconnect } = useWallet();
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [faucetClaiming, setFaucetClaiming] = useState(false);

  const handleClaimFaucetClick = () => {
    setFaucetClaiming(true);
    setTimeout(() => {
      onClaimFaucet();
      setFaucetClaiming(false);
    }, 800);
  };

  const handleDisconnectClick = async () => {
    if (connected) {
      try {
        await disconnect();
      } catch (err) {
        console.error("Failed to disconnect wallet adapter from Navbar", err);
      }
    }
    onDisconnect();
  };

  const isCorrectNet = currentNetwork === "shelbynet";


  return (
    <header className="sticky top-0 z-40 w-full border-b border-pink-100 bg-amber-50/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-400 to-rose-300 flex items-center justify-center text-white shadow-md shadow-pink-100/60 overflow-hidden">
          <div className="absolute inset-0 bg-white/10" />
          <Coins className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-800 flex items-center gap-2">
            Shelby <span className="font-medium text-pink-500 text-xs bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">Hot Storage</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-mono">shelbynet client v1.4</p>
        </div>
      </div>

      {/* Dynamic Network Status Panel & Petra Wallet Buttons */}
      <div className="flex items-center gap-4">
        {/* Network Picker */}
        <div className="relative">
          <button
            id="network-selector-btn"
            onClick={() => setShowNetworkMenu(!showNetworkMenu)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              isCorrectNet
                ? "bg-emerald-50/60 text-emerald-700 border-emerald-100 hover:bg-emerald-50"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${isCorrectNet ? "animate-spin" : ""}`} style={{ animationDuration: '6s' }} />
            <span className="capitalize">{currentNetwork}</span>
            {!isCorrectNet && <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />}
          </button>

          <AnimatePresence>
            {showNetworkMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNetworkMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-100 p-2 shadow-xl z-20"
                >
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider px-3 pt-2 pb-1 font-mono">Available Networks</p>
                  <button
                    onClick={() => {
                      onNetworkChange("shelbynet");
                      setShowNetworkMenu(false);
                    }}
                    className="w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs hover:bg-zinc-50 transition-colors"
                  >
                    <span className="font-semibold text-slate-700">Shelby Devnet (shelbynet)</span>
                    {isCorrectNet && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => {
                      onNetworkChange("aptos_mainnet");
                      setShowNetworkMenu(false);
                    }}
                    className="w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs hover:bg-pink-50/45 transition-colors"
                  >
                    <span className="text-slate-500">Aptos Mainnet</span>
                    {currentNetwork === "aptos_mainnet" && <Check className="w-3.5 h-3.5 text-pink-600" />}
                  </button>
                  <button
                    onClick={() => {
                      onNetworkChange("aptos_devnet");
                      setShowNetworkMenu(false);
                    }}
                    className="w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs hover:bg-pink-50/45 transition-colors"
                  >
                    <span className="text-slate-500">Aptos Devnet</span>
                    {currentNetwork === "aptos_devnet" && <Check className="w-3.5 h-3.5 text-pink-600" />}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Core Wallet Area */}
        {!walletConnected ? (
          <motion.button
            id="wallet-connect-btn"
            onClick={onConnect}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 shadow-md shadow-pink-100/80 transition-all border border-pink-400/20"
          >
            <Wallet className="w-4 h-4" />
            Connect Petra Wallet
          </motion.button>
        ) : (
          <div className="relative">
            <motion.button
              id="wallet-info-btn"
              onClick={() => setShowWalletMenu(!showWalletMenu)}
              whileHover={{ scale: 1.01 }}
              className="flex items-center gap-2.5 pl-3.5 pr-2.5 py-1.5 rounded-xl border border-pink-100 bg-white/90 hover:bg-white text-xs font-medium text-slate-800 transition-all shadow-sm"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <div className="text-left">
                <p className="font-mono text-[11px] text-slate-700 leading-none pb-0.5">{truncateAddress(walletAddress)}</p>
                <p className="text-[9px] text-pink-500 font-semibold leading-none font-mono">
                  {aptBalance.toFixed(3)} APT | {susdBalance.toFixed(1)} SUSD
                </p>
              </div>
              <div className="w-6 h-6 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </motion.button>

            <AnimatePresence>
              {showWalletMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowWalletMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-rose-50/60 p-4 shadow-xl z-20"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Petra Wallet</p>
                        <p className="text-xs font-mono text-slate-700 mt-0.5 select-all">{walletAddress}</p>
                      </div>
                      <button
                        onClick={handleDisconnectClick}
                        title="Disconnect Wallet"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Token breakdowns */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/40">
                        <span className="text-xs text-slate-500 font-medium">Gas Token (APT)</span>
                        <span className="text-xs font-bold text-slate-800 font-mono">{aptBalance.toFixed(4)} APT</span>
                      </div>
                      <div className="flex items-center justify-between bg-pink-50/40 p-2.5 rounded-xl border border-pink-100/40">
                        <span className="text-xs text-slate-500 font-medium">Storage Token (SUSD)</span>
                        <span className="text-xs font-bold text-pink-600 font-mono">{susdBalance.toFixed(2)} SUSD</span>
                      </div>
                    </div>

                    {/* Faucet action */}
                    <button
                      id="faucet-claim-btn"
                      disabled={faucetClaiming}
                      onClick={handleClaimFaucetClick}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${faucetClaiming ? "animate-spin" : ""}`} />
                      {faucetClaiming ? "Claiming Coins..." : "Get devnet APT & SUSD"}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
