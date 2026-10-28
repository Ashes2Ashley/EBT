import React, { useState } from 'react';
import { 
  DollarSign, 
  ShieldAlert, 
  Check, 
  Copy, 
  ExternalLink, 
  ArrowRight, 
  AlertTriangle, 
  Zap, 
  Flame, 
  Layers 
} from 'lucide-react';
import { CryptoWalletTracing } from '../types/osint';
import { CRYPTO_WALLETS } from '../data/forensicsData';
import { soundManager } from '../utils/audioAlert';

export const CryptoWalletRadar: React.FC = () => {
  const [wallets] = useState<CryptoWalletTracing[]>(CRYPTO_WALLETS);
  const [selectedWallet, setSelectedWallet] = useState<CryptoWalletTracing>(CRYPTO_WALLETS[0]);
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddr(addr);
    soundManager.playAlertChime('MED');
    setTimeout(() => setCopiedAddr(null), 2000);
  };

  return (
    <div className="space-y-4 font-mono text-slate-200">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-950 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              ILLICIT CRYPTOCURRENCY TRACING & RANSOMWARE WALLET RADAR
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monero (XMR) and Bitcoin (BTC) transaction clustering, Wasabi CoinJoin mixer detection, and OFAC sanctions screening
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400">OFAC COMPLIANCE:</span>
          <span className="text-red-400 font-bold">SANCTIONED CLUSTERS FLAGGED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Wallet List (5 Cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Monitored Threat Actor Wallets ({wallets.length}):
          </span>
          {wallets.map(w => {
            const isSelected = selectedWallet.address === w.address;
            return (
              <div
                key={w.address}
                onClick={() => {
                  setSelectedWallet(w);
                  soundManager.playAlertChime('MED');
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold">
                      {w.currency}
                    </span>
                    <span className="font-bold text-xs truncate max-w-[200px]">{w.clusterLabel}</span>
                  </div>
                  {w.isSanctionedOfac && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold animate-pulse">
                      OFAC SANCTIONED
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 break-all font-mono">
                  {w.address}
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                  <span className="text-emerald-400 font-bold">{w.balance}</span>
                  <span className="text-slate-500 text-[10px]">{w.transactionCount} Hops Recorded</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Wallet Forensics & Transaction Hops (7 Cols) */}
        <div className="lg:col-span-7 rounded-xl bg-slate-950 border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">CLUSTER IDENTITY</span>
              <h3 className="text-base font-bold text-white mt-0.5">{selectedWallet.clusterLabel}</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">RISK SCORE:</span>
              <span className="text-xl font-black text-red-400">{selectedWallet.riskScore} / 100</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Cryptographic Wallet Address:</span>
            <div className="flex items-center justify-between gap-2">
              <code className="text-emerald-400 break-all text-[11px]">{selectedWallet.address}</code>
              <button
                onClick={() => handleCopy(selectedWallet.address)}
                className="text-slate-400 hover:text-white shrink-0"
              >
                {copiedAddr === selectedWallet.address ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-xs space-y-1">
            <span className="text-[10px] font-bold text-red-400 uppercase flex items-center gap-1">
              <Flame className="w-3 h-3 text-red-400" /> RANSOMWARE EXTORTION TAINT:
            </span>
            <p className="text-slate-200">{selectedWallet.ransomwareTaint}</p>
          </div>

          {/* Transaction Hops Graph */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Observed Blockchain Laundering Hops & Mixer Exfiltration:
            </span>
            <div className="space-y-2">
              {selectedWallet.recentHops.map((hop, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">{hop.amount}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {hop.hopType}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Destination: <strong className="text-white">{hop.destination}</strong></span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    TX: {hop.txHash} ({hop.timestamp})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
