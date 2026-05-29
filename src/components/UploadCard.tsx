import { useState, useRef, DragEvent, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileUp, ShieldAlert, Sparkles, AlertCircle, File, CheckCircle, Scale } from 'lucide-react';
import { calculateStoragePrice } from '../lib/aptos';

interface UploadCardProps {
  walletConnected: boolean;
  walletAddress: string | null;
  isCorrectNetwork: boolean;
  isUploading: boolean;
  uploadProgress: number;
  onUpload: (file: File, description: string, storageCost: number, gasCost: number) => Promise<any>;
  aptBalance: number;
  susdBalance: number;
  onConnectWallet: () => void;
}

export default function UploadCard({
  walletConnected,
  walletAddress,
  isCorrectNetwork,
  isUploading,
  uploadProgress,
  onUpload,
  aptBalance,
  susdBalance,
  onConnectWallet
}: UploadCardProps) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estimations
  const storageCost = selectedFile ? calculateStoragePrice(selectedFile.size) : 0;
  // Estimated tx gas ranges from 0.002 to 0.003 APT
  const gasCost = 0.0025;

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setErr(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // File validations
      if (file.size > 50 * 1024 * 1024) { // 50MB Cap
        setErr("File size exceeds 50MB hot storage block limit on Shelby devnet.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    setErr(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) {
        setErr("File size exceeds 50MB hot storage block limit on Shelby devnet.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setDescription("");
    setErr(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!selectedFile) {
      setErr("Please select a file to upload.");
      return;
    }

    if (!walletConnected) {
      onConnectWallet();
      return;
    }

    if (!isCorrectNetwork) {
      setErr("Please switch Petra wallet network to 'shelbynet' to broadcast this streaming payload.");
      return;
    }

    // Check balances
    if (aptBalance < gasCost) {
      setErr(`Insufficient APT gas. Estimation requires ${gasCost} APT. Claim free faucet tokens first!`);
      return;
    }

    if (susdBalance < storageCost) {
      setErr(`Insufficient ShelbyUSD storage funds. This file requires ${storageCost} SUSD. Faucet top-up is available!`);
      return;
    }

    try {
      await onUpload(selectedFile, description, storageCost, gasCost);
      // Clean states on success
      setSelectedFile(null);
      setDescription("");
    } catch (e: any) {
      setErr(e.message || "Shelby Hot Storage upload failed.");
    }
  };

  return (
    <div id="upload-card-wrapper" className="bg-white border border-pink-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-rose-50 mb-4">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800">Upload Media Payload</h2>
          <p className="text-[11px] text-slate-400">Stores directly on Shelby Decentralized Storage nodes</p>
        </div>
        <Scale className="w-4 h-4 text-pink-400" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            dragActive 
              ? "border-pink-500 bg-pink-50/40" 
              : "border-slate-200 hover:border-pink-400 bg-amber-50/10 hover:bg-amber-50/30"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            className="hidden"
            id="media-file-input"
          />

          {!selectedFile ? (
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mx-auto">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Drag & Drop media file here, or click to browse</p>
              <p className="text-[10px] text-slate-400 font-mono">Supports MP4, MP3, JPG/PNG, PDFs, zip, docx up to 50MB</p>
            </div>
          ) : (
            <div className="space-y-2 w-full">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <File className="w-5 h-5 animate-bounce" />
              </div>
              <p className="text-xs font-bold text-slate-705 truncate max-w-xs">{selectedFile.name}</p>
              <p className="text-[10px] text-slate-400 font-mono">
                Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="text-[10px] text-rose-500 hover:underline font-bold"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {/* Selected file spec calculation metrics */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-amber-50/30 border border-amber-100/40 rounded-xl p-3 space-y-2"
            >
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">Network Quotation</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-50">
                  <span className="text-slate-400 text-[9px] block">APT Gas Coordination:</span>
                  <strong className="text-slate-700 font-mono">{gasCost.toFixed(4)} APT</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-50">
                  <span className="text-slate-400 text-[9px] block">ShelbyUSD Space Allocation:</span>
                  <strong className="text-pink-600 font-mono">{storageCost.toFixed(3)} SUSD</strong>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File description field */}
        <div>
          <label htmlFor="media-description" className="block text-[10px] font-bold text-slate-400 uppercase font-mono pb-1.5">
            File Description (Stored as Metadata Onchain)
          </label>
          <input
            id="media-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUploading}
            placeholder="e.g. Shelby promotional video with high quality cinematic renders"
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-pink-300 disabled:opacity-50"
          />
        </div>

        {/* Error status panel */}
        {err && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{err}</span>
          </div>
        )}

        {/* Big Action button */}
        {!walletConnected ? (
          <button
            type="button"
            onClick={onConnectWallet}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4" /> Connect Wallet & Lock storage
          </button>
        ) : (
          <button
            type="submit"
            disabled={isUploading || !selectedFile}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deducting SUSD & Writing Storage...
              </span>
            ) : (
              <>
                <FileUp className="w-4 h-4" /> Upload & Broadcast Media
              </>
            )}
          </button>
        )}

        {/* Progress Overlay bar */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-pink-50/50 rounded-xl p-3 space-y-2 border border-pink-100"
            >
              <div className="flex justify-between text-[11px] text-pink-700 font-bold">
                <span>Pushing blob to Shelby storing nodes...</span>
                <span className="font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-pink-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-400 font-mono text-center">
                Awaiting Petra Wallet broad ledger synchronization...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
