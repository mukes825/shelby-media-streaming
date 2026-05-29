import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Copy, ExternalLink, Search, Database, FileText, Check, HelpCircle, HardDrive, Cpu } from 'lucide-react';
import { BlobItem, MediaTab } from '../types';
import { truncateAddress } from '../lib/aptos';

interface BlobTableProps {
  blobs: BlobItem[];
  activeTab: MediaTab;
  onStream: (blob: BlobItem) => void;
  activeBlobId: string | null;
}

export default function BlobTable({ blobs, activeTab, onStream, activeBlobId }: BlobTableProps) {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Helper: Format bytes to MB/KB elegantly
  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  // Filter & Search Logic
  const filtered = blobs.filter((b) => {
    // 1. Tab filter
    if (activeTab !== "all") {
      if (activeTab === "video" && !b.type.startsWith("video/")) return false;
      if (activeTab === "audio" && !b.type.startsWith("audio/")) return false;
      if (activeTab === "image" && !b.type.startsWith("image/")) return false;
      if (activeTab === "document" && b.type.startsWith("video/") && b.type.startsWith("audio/") && b.type.startsWith("image/")) return false;
      if (activeTab === "document" && (b.type.startsWith("video/") || b.type.startsWith("audio/") || b.type.startsWith("image/"))) return false;
    }

    // 2. Search match
    if (search.trim() !== "") {
      const query = search.toLowerCase();
      return b.name.toLowerCase().includes(query) || b.description.toLowerCase().includes(query) || b.id.toLowerCase().includes(query);
    }

    return true;
  });

  const handleCopyUrl = (blobId: string) => {
    const streamUrl = `https://api.shelbynet.shelby.xyz/shelby/blobs/${blobId}/stream`;
    navigator.clipboard.writeText(streamUrl);
    setCopiedId(blobId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Top controls: title & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-rose-50">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <Database className="w-4 h-4 text-pink-500" />
            Shelby Storage Register
          </h2>
          <p className="text-[11px] text-slate-400">Total verified items indexed: {filtered.length}</p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-64">
          <input
            id="search-media-blobs"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search filenames or metadata..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-pink-300"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Blob listing layout */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <Database className="w-8 h-8 text-slate-300 mx-auto animate-bounce" />
          <p className="text-xs text-slate-500 font-medium">No decentralized blobs found matching current parameters.</p>
          <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Upload video, audio, layout images, or documents to register live stream routes under shelbynet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-50 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Blob ID & Name</th>
                <th className="py-2.5 px-3">Size & Type</th>
                <th className="py-2.5 px-3">Metadata Info</th>
                <th className="py-2.5 px-3">Node Fees</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filtered.map((b) => {
                  const isActive = activeBlobId === b.id;
                  return (
                    <motion.tr
                      key={b.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`group hover:bg-slate-50/50 transition-colors ${
                        isActive ? "bg-pink-50/30" : ""
                      }`}
                    >
                      {/* Name / ID columns */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-xs text-slate-800 max-w-xs truncate">{b.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 pt-0.5">
                          <span className="font-bold text-pink-500 uppercase text-[8px] bg-pink-50 px-1 rounded border border-pink-100">
                            ID:
                          </span>
                          <span className="truncate max-w-[120px]" title={b.id}>{b.id}</span>
                        </div>
                      </td>

                      {/* Size / type */}
                      <td className="py-3 px-3">
                        <div className="text-xs font-mono text-slate-700">{formatSize(b.size)}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{b.type}</div>
                      </td>

                      {/* Description / date */}
                      <td className="py-3 px-3 max-w-xs">
                        <p className="text-[11px] text-slate-600 line-clamp-1">{b.description}</p>
                        <div className="text-[9px] text-slate-400 font-mono pt-1 flex items-center gap-2">
                          <span>{b.uploadedAt}</span>
                          <span className="text-slate-300">|</span>
                          <span title={b.senderAddress}>Addr: {truncateAddress(b.senderAddress)}</span>
                        </div>
                      </td>

                      {/* Node Fees allocation */}
                      <td className="py-3 px-3 font-mono text-[10px]">
                        <div className="text-amber-700 font-semibold">{b.gasPaid} APT</div>
                        <div className="text-pink-600 font-semibold">{b.storageCost} SUSD</div>
                      </td>

                      {/* Playback action items */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                          {/* Stream payload */}
                          <motion.button
                            onClick={() => onStream(b)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              isActive
                                ? "bg-pink-500 text-white"
                                : "bg-slate-100 text-slate-700 hover:bg-pink-100 hover:text-pink-600"
                            }`}
                            title="Stream on Shelby Media Player"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span className="sr-only sm:not-sr-only text-[10px]">Stream</span>
                          </motion.button>

                          {/* Copy URL clipboard */}
                          <motion.button
                            onClick={() => handleCopyUrl(b.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${
                              copiedId === b.id 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50"
                            }`}
                            title="Copy permanent stream URL"
                          >
                            {copiedId === b.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span className="sr-only sm:not-sr-only text-[10px]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="sr-only sm:not-sr-only text-[10px]">Url</span>
                              </>
                            )}
                          </motion.button>

                          {/* Explorer link */}
                          <motion.a
                            href={`https://explorer.shelby.xyz/shelbynet/txn/${b.txnHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05 }}
                            className="p-1.5 rounded-lg border border-slate-100 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                            title="View Transaction in Shelby Explorer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </motion.a>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
