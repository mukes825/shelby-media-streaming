import { motion } from 'motion/react';
import { LayoutGrid, Video, Music, Image as ImageIcon, FileText, Globe2, Link, Server, ShieldCheck } from 'lucide-react';
import { MediaTab } from '../types';
import { SHELBYNET_CONFIG } from '../lib/aptos';

interface SidebarProps {
  activeTab: MediaTab;
  onTabChange: (tab: MediaTab) => void;
  blobsCount: {
    all: number;
    video: number;
    audio: number;
    image: number;
    document: number;
  };
}

export default function Sidebar({ activeTab, onTabChange, blobsCount }: SidebarProps) {
  const menuItems = [
    { id: 'all' as MediaTab, label: 'All Blobs', icon: LayoutGrid, count: blobsCount.all, color: 'text-slate-600' },
    { id: 'video' as MediaTab, label: 'Videos', icon: Video, count: blobsCount.video, color: 'text-pink-600' },
    { id: 'audio' as MediaTab, label: 'Audio Tracks', icon: Music, count: blobsCount.audio, color: 'text-violet-600' },
    { id: 'image' as MediaTab, label: 'Image Blobs', icon: ImageIcon, count: blobsCount.image, color: 'text-rose-600' },
    { id: 'document' as MediaTab, label: 'Documents', icon: FileText, count: blobsCount.document, color: 'text-blue-600' },
  ];

  return (
    <aside className="w-72 bg-amber-50/40 border-r border-pink-100 flex flex-col p-5 space-y-7 shrink-0 hidden md:flex">
      {/* Platform Welcome Card */}
      <div className="bg-gradient-to-br from-pink-500/10 to-rose-400/5 border border-pink-200/40 rounded-2xl p-4">
        <p className="text-xs font-semibold text-pink-600 flex items-center gap-1.5 pb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Hot Storage Enabled
        </p>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Shelby Devnet integrates state-of-the-art Web3 hot retrieval pipelines. Files are instantly read-optimized and streamable.
        </p>
      </div>

      {/* Filter Tabs Section */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 px-2 pb-1">Media Storage Tabs</p>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500/10 to-pink-50/20 text-pink-600 border border-pink-200/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-pink-600' : item.color}`} />
                  <span>{item.label}</span>
                </div>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-pink-100 text-pink-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Verified Node Metrics Container */}
      <div className="mt-auto space-y-4 pt-4 border-t border-pink-100">
        <div>
          <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 px-2 pb-2">Verified Configs</p>
          <div className="bg-white/80 border border-pink-50 rounded-xl p-3 space-y-2.5 shadow-sm">
            
            <div className="flex items-start gap-2.5">
              <Server className="w-3.5 h-3.5 text-pink-400 mt-0.5 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-[9px] font-mono font-bold text-slate-700 uppercase leading-none pb-1">Shelby RPC</p>
                <p className="text-[8px] font-mono text-slate-400 truncate select-all">{SHELBYNET_CONFIG.rpcUrl}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Globe2 className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-[9px] font-mono font-bold text-slate-700 uppercase leading-none pb-1">Full Node</p>
                <p className="text-[8px] font-mono text-slate-400 truncate select-all">{SHELBYNET_CONFIG.fullnode}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Link className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-[9px] font-mono font-bold text-slate-700 uppercase leading-none pb-1">Explorer</p>
                <a
                  href={SHELBYNET_CONFIG.explorerUrl}
                  target="_blank"
                  rel="noreferrer" 
                  className="text-[8px] font-mono text-pink-500 hover:underline truncate block"
                >
                  shelbynet-explorer.shelby.xyz
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </aside>
  );
}
