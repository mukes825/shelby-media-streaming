import { useState, useMemo, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Compass, AlertCircle, RefreshCw, Cpu, Database } from 'lucide-react';

import { useWallet } from '@aptos-labs/wallet-adapter-react';

// Core imports
import { BlobItem, MediaTab } from './types';
import { truncateAddress } from './lib/aptos';
import { useBalances } from './hooks/useBalances';
import { useNetworkValidation } from './hooks/useNetworkValidation';
import { useShelbyClient } from './hooks/useShelbyClient';

// UI components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BalanceCards from './components/BalanceCards';
import UploadCard from './components/UploadCard';
import BlobTable from './components/BlobTable';
import MediaPlayer from './components/MediaPlayer';

export default function App() {
  const { connect, disconnect, connected, account } = useWallet();

  // 1. Connection state variables (Mock/Sandbox mode)
  const [mockConnected, setMockConnected] = useState<boolean>(() => {
    return localStorage.getItem("shelby_mock_connected_v1") === "true";
  });
  const [mockAddress, setMockAddress] = useState<string | null>(() => {
    return localStorage.getItem("shelby_mock_address_v1") || null;
  });

  const walletConnected = connected || mockConnected;
  const walletAddress = connected
    ? (account?.address?.toString() || account?.address || null)
    : mockAddress;

  // Clear mock session if real wallet is active
  useEffect(() => {
    if (connected && account?.address) {
      localStorage.removeItem("shelby_mock_connected_v1");
      localStorage.removeItem("shelby_mock_address_v1");
      setMockConnected(false);
      setMockAddress(null);
    }
  }, [connected, account]);

  // 2. Custom sub-hooks
  const { currentNetwork, isCorrectNetwork, changeNetwork, targetNetwork } = useNetworkValidation(walletConnected);
  const { apt, susd, claimFaucet, deduct } = useBalances(walletConnected, walletAddress);
  const { blobs, loading, isUploading, uploadProgress, uploadMedia } = useShelbyClient();

  // 3. UI control states
  const [activeTab, setActiveTab] = useState<MediaTab>('all');
  const [selectedBlob, setSelectedBlob] = useState<BlobItem | null>(null);
  const [showWalletConnectorModal, setShowWalletConnectorModal] = useState<boolean>(false);

  // Tab counts
  const blobsCount = useMemo(() => {
    const counts = {
      all: blobs.length,
      video: 0,
      audio: 0,
      image: 0,
      document: 0
    };
    blobs.forEach((b) => {
      if (b.type.startsWith("video/")) counts.video++;
      else if (b.type.startsWith("audio/")) counts.audio++;
      else if (b.type.startsWith("image/")) counts.image++;
      else counts.document++;
    });
    return counts;
  }, [blobs]);

  // Wallet handlers
  const handleConnect = () => {
    setShowWalletConnectorModal(true);
  };

  const handleConfirmMockConnect = (customAddr: string) => {
    localStorage.setItem("shelby_mock_connected_v1", "true");
    localStorage.setItem("shelby_mock_address_v1", customAddr);
    setMockConnected(true);
    setMockAddress(customAddr);
    setShowWalletConnectorModal(false);
    toast.success(`Creator Sandbox connected to ${truncateAddress(customAddr)}!`, {
      style: {
        background: '#1e293b',
        color: '#fff',
        borderRadius: '16px',
        fontSize: '12px'
      }
    });
  };

  const handleDisconnect = () => {
    if (connected) {
      try {
        disconnect();
      } catch (err) {
        console.error("Failed to disconnect wallet adapter", err);
      }
    }
    localStorage.removeItem("shelby_mock_connected_v1");
    localStorage.removeItem("shelby_mock_address_v1");
    setMockConnected(false);
    setMockAddress(null);
    setSelectedBlob(null);
    toast(`Petra Wallet disconnected`, {
      icon: '🔔',
      style: {
        background: '#1e293b',
        color: '#fff',
        borderRadius: '16px',
        fontSize: '12px'
      }
    });
  };


  // Claim Faucet Handler
  const handleClaimFaucet = () => {
    claimFaucet();
    toast.success("Successfully claimed devnet 5.0 APT & 100.0 SUSD Storage utility coins!", {
      icon: '🎁',
      style: {
        background: '#047857',
        color: '#fff',
        borderRadius: '16px',
        fontSize: '12px'
      }
    });
  };

  // Upload handler wrapper coord
  const handleUploadMediaPayload = async (
    file: File,
    description: string,
    storageCost: number,
    gasCost: number
  ) => {
    if (!walletAddress) return;
    try {
      const result = await uploadMedia(
        file,
        description,
        walletAddress,
        deduct,
        storageCost,
        gasCost
      );
      if (result) {
        toast.success(`Decentralized Stream Active! Registered blob ${result.id}`, {
          icon: '🚀',
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '16px',
            fontSize: '12px'
          }
        });
        setSelectedBlob(result);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to finalize Shelby upload payload.");
    }
  };

  const handleStreamClick = (blob: BlobItem) => {
    setSelectedBlob(blob);
    toast(`Streaming ${blob.name}...`, {
      icon: '📺',
      style: {
        background: '#1e293b',
        color: '#fff',
        borderRadius: '16px',
        fontSize: '12px'
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col selection:bg-pink-100 selection:text-pink-700">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Primary Top Header Area */}
      <Navbar
        walletConnected={walletConnected}
        walletAddress={walletAddress}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        currentNetwork={currentNetwork}
        onNetworkChange={(net) => {
          changeNetwork(net);
          if (net !== "shelbynet") {
            toast.error("Switched away from shelbynet! Transactions will fail.", {
              style: { borderRadius: '16px', fontSize: '11px' }
            });
          } else {
            toast.success("Correct Network Synchronized!", {
              style: { borderRadius: '16px', fontSize: '11px' }
            });
          }
        }}
        onClaimFaucet={handleClaimFaucet}
        aptBalance={apt}
        susdBalance={susd}
      />

      {/* Main Grid Frame Area */}
      <div className="flex-1 flex flex-col md:flex-row w-full">
        {/* Responsive Side Filters */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          blobsCount={blobsCount}
        />

        {/* Dynamic Center Workstation Dashboard */}
        <main className="flex-grow p-4 md:p-8 space-y-7 max-w-7xl mx-auto w-full overflow-hidden">
          {/* Header Title bar panel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-800">Shelby Media Streaming</h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                <Compass className="w-3.5 h-3.5 text-pink-500" />
                Live indexing node registry synced with <span className="font-mono text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded border border-pink-100/60 font-bold">shelbynet</span>
              </p>
            </div>

            {/* Mobile quick view tabs */}
            <div className="flex md:hidden gap-1.5 overflow-x-auto pb-1">
              {(['all', 'video', 'audio', 'image'] as MediaTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold capitalize whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? "bg-pink-500 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Connected Network Warning alert flag */}
          {!isCorrectNetwork && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-start gap-3 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Unsupported Wallet Network Detected</p>
                <p className="opacity-90 mt-0.5">
                  Currently running on <span className="font-bold capitalize">{currentNetwork}</span>. Please toggle the network picker to <span className="font-bold font-mono">shelbynet</span> to sign storage and rent coordinates.
                </p>
              </div>
            </motion.div>
          )}

          {/* Balance Cards Panel */}
          <BalanceCards
            walletConnected={walletConnected}
            aptBalance={apt}
            susdBalance={susd}
            blobsCount={blobsCount.all}
            onClaimFaucet={handleClaimFaucet}
          />

          {/* Interactive Player & Upload grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Stream Retriever</p>
              <MediaPlayer
                blob={selectedBlob}
                onClose={() => setSelectedBlob(null)}
              />
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

          {/* Storage Blob Table Registry */}
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

      {/* Petra Wallet Adapter Emulator Modal Dialog */}
      <AnimatePresence>
        {showWalletConnectorModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-rose-50 border-t-pink-500 border-t-4 max-w-md w-full p-6 shadow-2xl relative"
            >
              <h3 className="text-base font-extrabold text-slate-800">Hook Petra Wallet</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Choose the connection pipeline to sync with Shelby Devnet storage nodes. If no Petra extension is present, choose standard Emulator sync for instant testing.
              </p>

              <div className="mt-5 space-y-3">
                {/* Simulated Petra adapter selector */}
                <button
                  type="button"
                  id="petra-extension-connector-btn"
                  onClick={async () => {
                    try {
                      await connect("Petra" as any);
                      setShowWalletConnectorModal(false);
                      toast.success("Petra Wallet connection requested!", {
                        style: { borderRadius: '16px', fontSize: '11px' }
                      });
                    } catch (err: any) {
                      toast.error(err.message || "Failed to trigger Petra wallet extension");
                    }
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100/80 hover:border-amber-200 border border-amber-100 text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500 text-white flex items-center justify-center font-bold">P</div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Official Petra Wallet Adapter</p>
                      <p className="text-[10px] text-slate-400">Connect via physical Petra browser payload</p>
                    </div>
                  </div>
                </button>

                {/* Developer customized emulator selector */}
                <button
                  type="button"
                  id="emulator-connector-btn"
                  onClick={() => {
                    // Seed standard Creator account
                    handleConfirmMockConnect("0xb18363a9f1fe5e6ebf247daba5cc1c18052bb232efd");
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-pink-50 hover:bg-pink-100/80 hover:border-pink-200 border border-pink-100 text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-500 text-white flex items-center justify-center text-xs">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Creator Sandbox Account</p>
                      <p className="text-[10px] text-slate-400">Pre-loaded with SUSD, direct debug console</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={() => setShowWalletConnectorModal(false)}
                className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ledger footer metrics */}
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
