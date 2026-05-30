import { useState, useMemo } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Compass, AlertCircle, Database } from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

type WalletName<T extends string> = T & { __brand?: any };

import { BlobItem, MediaTab } from './types';
import { useBalances } from './hooks/useBalances';
import { useNetworkValidation } from './hooks/useNetworkValidation';
import { useShelbyClient } from './hooks/useShelbyClient';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BalanceCards from './components/BalanceCards';
import UploadCard from './components/UploadCard';
import BlobTable from './components/BlobTable';
import MediaPlayer from './components/MediaPlayer';

export default function App() {
  const { connect, disconnect, connected, account } = useWallet();

  const walletConnected = connected;
  const walletAddress = account?.address?.toString() || (account?.address as any) || null;

  const { currentNetwork, isCorrectNetwork, changeNetwork } = useNetworkValidation(walletConnected);
  const { apt, susd, claimFaucet, deduct } = useBalances(walletConnected, walletAddress);
  const { blobs, loading, isUploading, uploadProgress, uploadMedia } = useShelbyClient();

  const [activeTab, setActiveTab] = useState<MediaTab>('all');
  const [selectedBlob, setSelectedBlob] = useState<BlobItem | null>(null);

  const blobsCount = useMemo(() => {
    const counts = { all: blobs.length, video: 0, audio: 0, image: 0, document: 0 };
    blobs.forEach((b) => {
      if (b.type.startsWith("video/")) counts.video++;
      else if (b.type.startsWith("audio/")) counts.audio++;
      else if (b.type.startsWith("image/")) counts.image++;
      else counts.document++;
    });
    return counts;
  }, [blobs]);

  const handleConnect = async () => {
    try {
      await connect("Petra" as WalletName<"Petra">);
      toast.success("Connected to Petra Wallet");
    } catch (error: any) {
      toast.error("Petra Wallet not found. Please install/unlock Petra extension.", { duration: 5000 });
    }
  };

  const handleDisconnect = () => {
    if (connected) {
      try { disconnect(); } catch (err) { console.error(err); }
    }
    setSelectedBlob(null);
    toast('Petra Wallet disconnected', {
      icon: '🔔',
      style: { background: '#1e293b', color: '#fff', borderRadius: '16px', fontSize: '12px' }
    });
  };

  const handleClaimFaucet = async () => {
    const ok = await claimFaucet();
    if (ok) {
      toast.success("Shelby Devnet faucet claimed! APT & SUSD incoming...", {
        icon: '🎁',
        style: { background: '#047857', color: '#fff', borderRadius: '16px', fontSize: '12px' }
      });
    } else {
      toast.error("Faucet claim failed. Check devnet connection.", {
        style: { borderRadius: '16px', fontSize: '12px' }
      });
    }
  };

  const handleUploadMediaPayload = async (
    file: File,
    description: string,
    storageCost: number,
    gasCost: number
  ) => {
    if (!walletAddress) return;
    try {
      const result = await uploadMedia(file, description, walletAddress, deduct, storageCost, gasCost);
      if (result) {
        toast.success(`Stream Active! Blob ${result.id} registered`, {
          icon: '🚀',
          duration: 4000,
          style: { background: '#1e293b', color: '#fff', borderRadius: '16px', fontSize: '12px' }
        });
        setSelectedBlob(result);
      }
    } catch (e: any) {
      toast.error(e.message || "Upload failed.");
    }
  };

  const handleStreamClick = (blob: BlobItem) => {
    setSelectedBlob(blob);
    toast(`Streaming ${blob.name}...`, {
      icon: '📺',
      style: { background: '#1e293b', color: '#fff', borderRadius: '16px', fontSize: '12px' }
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col selection:bg-pink-100 selection:text-pink-700">
      <Toaster position="top-right" reverseOrder={false} />

      <Navbar
        walletConnected={walletConnected}
        walletAddress={walletAddress}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        currentNetwork={currentNetwork}
        onNetworkChange={(net) => {
          changeNetwork(net);
          if (net !== "shelbynet") {
            toast.error("Switched away from shelbynet!", { style: { borderRadius: '16px', fontSize: '11px' } });
          } else {
            toast.success("Correct Network Synchronized!", { style: { borderRadius: '16px', fontSize: '11px' } });
          }
        }}
        onClaimFaucet={handleClaimFaucet}
        aptBalance={apt}
        susdBalance={susd}
      />

      <div className="flex-1 flex flex-col md:flex-row w-full">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} blobsCount={blobsCount} />

        <main className="flex-grow p-4 md:p-8 space-y-7 max-w-7xl mx-auto w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-800">Shelby Media Streaming</h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                <Compass className="w-3.5 h-3.5 text-pink-500" />
                Live indexing node registry synced with{' '}
                <span className="font-mono text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded border border-pink-100/60 font-bold">shelbynet</span>
              </p>
            </div>
            <div className="flex md:hidden gap-1.5 overflow-x-auto pb-1">
              {(['all', 'video', 'audio', 'image'] as MediaTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold capitalize whitespace-nowrap transition-colors ${
                    activeTab === tab ? "bg-pink-500 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {!isCorrectNetwork && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-start gap-3 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Wrong Network Detected</p>
                <p className="opacity-90 mt-0.5">Switch to <span className="font-bold font-mono">shelbynet</span> to sign transactions.</p>
              </div>
            </motion.div>
          )}

          <BalanceCards
            walletConnected={walletConnected}
            aptBalance={apt}
            susdBalance={susd}
            blobsCount={blobsCount.all}
            onClaimFaucet={handleClaimFaucet}
          />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Stream Retriever</p>
              <MediaPlayer blob={selectedBlob} onClose={() => setSelectedBlob(null)} />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Broadcaster Node</p>
              <UploadCard
                walletConnected={walletConnected}
                walletAddress={walletAddress}
                isCorrectNetwork={isCorrectNetwork}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                onUpload={handleUploadMediaPayload}
                aptBalance={apt}
                susdBalance={susd}
                onConnectWallet={handleConnect}
              />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Synced Ledger Blobs</p>
            <BlobTable
              blobs={blobs}
              activeTab={activeTab}
              onStream={handleStreamClick}
              activeBlobId={selectedBlob ? selectedBlob.id : null}
            />
          </div>
        </main>
      </div>

      <footer className="bg-amber-50/20 py-6 border-t border-pink-50 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400 font-mono">
        <p>© 2026 Shelby Media Platform. Built on Aptos Hot Retrieval Layers.</p>
        <p className="flex items-center gap-1.5 uppercase font-bold text-slate-400">
          <Database className="w-3.5 h-3.5 text-pink-500" />
          Node Status: <span className="text-emerald-600 animate-pulse">Synced & Online</span>
        </p>
      </footer>
    </div>
  );
}
