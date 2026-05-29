import { motion } from 'framer-motion';
import { Coins, HardDrive, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface BalanceCardsProps {
  walletConnected: boolean;
  aptBalance: number;
  susdBalance: number;
  blobsCount: number;
  onClaimFaucet: () => void;
}

export default function BalanceCards({
  walletConnected,
  aptBalance,
  susdBalance,
  blobsCount,
  onClaimFaucet
}: BalanceCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* APT GAS token Card */}
      <motion.div
        whileHover={{ y: -2 }}
        className="relative overflow-hidden bg-white/90 border border-amber-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase font-bold text-slate-400 pb-1">Gas Coordination Token</p>
            <h3 className="text-2xl font-black font-mono text-slate-800 tracking-tight">
              {walletConnected ? `${aptBalance.toFixed(4)} APT` : "—"}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Rate: ~0.0015 APT / txn</span>
          {walletConnected ? (
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active gas pool
            </span>
          ) : (
            <span className="text-slate-400 flex items-center gap-1">Connect wallet</span>
          )}
        </div>
      </motion.div>

      {/* ShelbyUSD storage token Card */}
      <motion.div
        whileHover={{ y: -2 }}
        className="relative overflow-hidden bg-white/90 border border-pink-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase font-bold text-slate-400 pb-1">Hot Storage Allocator</p>
            <h3 className="text-2xl font-black font-mono text-pink-600 tracking-tight">
              {walletConnected ? `${susdBalance.toFixed(2)} SUSD` : "—"}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
            <HardDrive className="w-5 h-5 animate-pulse" />
          </div>
        </div>
        <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Rate: $0.10 ShelbyUSD / MB</span>
          {walletConnected ? (
            <button
              onClick={onClaimFaucet}
              className="text-pink-500 font-bold hover:text-pink-600 flex items-center gap-1 animate-pulse"
            >
              <Sparkles className="w-3 h-3" /> Faucet top-up
            </button>
          ) : (
            <span className="text-slate-400">Connect wallet</span>
          )}
        </div>
      </motion.div>

      {/* Total Storage Blobs Metrics Card */}
      <motion.div
        whileHover={{ y: -2 }}
        className="relative overflow-hidden bg-white/90 border border-rose-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase font-bold text-slate-400 pb-1">Retrieved Blobs</p>
            <h3 className="text-2xl font-black font-mono text-rose-700 tracking-tight">
              {blobsCount} Active Items
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
          <p className="truncate">Perm URL stream enabled</p>
          <span className="font-mono text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded uppercase font-bold">100% SLA</span>
        </div>
      </motion.div>
    </div>
  );
}
