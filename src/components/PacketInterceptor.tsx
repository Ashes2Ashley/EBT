import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Play, 
  Pause, 
  Terminal, 
  Filter, 
  ShieldAlert, 
  Check, 
  Copy, 
  Zap, 
  Flame, 
  Search,
  ExternalLink
} from 'lucide-react';
import { PacketRecord } from '../types/osint';
import { SAMPLE_PACKETS } from '../data/forensicsData';
import { soundManager } from '../utils/audioAlert';

interface PacketInterceptorProps {
  onSelectIpForInvestigation: (ip: string) => void;
}

export const PacketInterceptor: React.FC<PacketInterceptorProps> = ({ onSelectIpForInvestigation }) => {
  const [packets, setPackets] = useState<PacketRecord[]>(SAMPLE_PACKETS);
  const [isCapturing, setIsCapturing] = useState(true);
  const [selectedPacket, setSelectedPacket] = useState<PacketRecord>(SAMPLE_PACKETS[0]);
  const [filterMaliciousOnly, setFilterMaliciousOnly] = useState(false);
  const [protocolFilter, setProtocolFilter] = useState('ALL');
  const [copiedHex, setCopiedHex] = useState(false);

  // Simulated live packet generation
  useEffect(() => {
    if (!isCapturing) return;

    const interval = setInterval(() => {
      const ports = [502, 443, 3389, 8080, 22, 53];
      const isMal = Math.random() > 0.4;
      const srcIps = ['198.51.100.24', '185.220.101.5', '167.99.145.82', '199.111.226.1', '131.247.1.10'];
      const dstIps = ['199.111.226.1', '131.247.1.10', '198.51.100.24'];

      const src = srcIps[Math.floor(Math.random() * srcIps.length)];
      const dst = dstIps[Math.floor(Math.random() * dstIps.length)];
      const port = ports[Math.floor(Math.random() * ports.length)];

      const newPkt: PacketRecord = {
        id: `pkt-${Date.now()}`,
        timestamp: new Date().toISOString().split('T')[1].slice(0, 12),
        srcIp: src,
        srcPort: Math.floor(30000 + Math.random() * 30000),
        dstIp: dst,
        dstPort: port,
        protocol: port === 53 ? 'UDP' : port === 443 ? 'TLS' : 'TCP',
        flags: isMal ? 'PSH, ACK' : 'ACK',
        lengthBytes: Math.floor(64 + Math.random() * 800),
        payloadAscii: isMal ? `[ANOMALY_PAYLOAD_DETECTED]: SCADA Function 0x05 write to grid coil // Exploit stream` : `Standard TCP Keepalive stream ACK`,
        payloadHex: Array.from({ length: 16 }).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(' '),
        isMalicious: isMal,
        ruleTriggered: isMal ? 'SURICATA: ET MALWARE Inbound SCADA Injection Probe' : undefined
      };

      setPackets(prev => [newPkt, ...prev.slice(0, 30)]);
      if (isMal) {
        soundManager.playAlertChime('MED');
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isCapturing]);

  const filtered = packets.filter(pkt => {
    if (filterMaliciousOnly && !pkt.isMalicious) return false;
    if (protocolFilter !== 'ALL' && pkt.protocol !== protocolFilter) return false;
    return true;
  });

  const handleCopyHex = () => {
    navigator.clipboard.writeText(selectedPacket.payloadHex);
    setCopiedHex(true);
    setTimeout(() => setCopiedHex(false), 2000);
  };

  return (
    <div className="space-y-4 font-mono text-slate-200">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-950 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-wide">
              LIVE NETWORK PACKET INTERCEPTOR & DEEP HEX DISSECTOR
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time payload inspection on Georgia & Florida critical infrastructure gateway taps (Port 502 Modbus, TLS, RDP, SSH)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCapturing(!isCapturing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              isCapturing ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-amber-950/80 border-amber-500 text-amber-300'
            }`}
          >
            {isCapturing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isCapturing ? 'TAP: CAPTURING' : 'TAP: PAUSED'}</span>
          </button>

          <button
            onClick={() => setFilterMaliciousOnly(!filterMaliciousOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              filterMaliciousOnly
                ? 'bg-red-950 border-red-500 text-red-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {filterMaliciousOnly ? 'ANOMALIES ONLY' : 'ALL PACKETS'}
          </button>
        </div>
      </div>

      {/* Main Grid: Packet List (7 Cols) + Dissector Inspector (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Packet Stream Table */}
        <div className="lg:col-span-7 rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-2 overflow-x-auto">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800 font-bold px-2">
            <span>TIME</span>
            <span>SOURCE &bull; DESTINATION</span>
            <span>PROTO</span>
            <span>LEN</span>
            <span>FLAG</span>
          </div>

          <div className="space-y-1.5 max-h-[520px] overflow-y-auto">
            {filtered.map(pkt => {
              const isSelected = selectedPacket.id === pkt.id;
              return (
                <div
                  key={pkt.id}
                  onClick={() => {
                    setSelectedPacket(pkt);
                    soundManager.playAlertChime('MED');
                  }}
                  className={`p-2 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 text-white'
                      : pkt.isMalicious
                      ? 'bg-red-950/20 border-red-900/60 hover:border-red-500/70 text-red-200'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">{pkt.timestamp}</span>
                    <span className="font-mono text-[11px] text-white">
                      {pkt.srcIp}:{pkt.srcPort} &rarr; {pkt.dstIp}:{pkt.dstPort}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-right">
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                      {pkt.protocol}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{pkt.lengthBytes}B</span>
                    {pkt.isMalicious && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-900 text-red-200 font-bold animate-pulse">
                        THREAT
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deep Dissector Inspector */}
        <div className="lg:col-span-5 rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-3">
          <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Packet Dissector & Hex Stream
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">{selectedPacket.protocol} (Frame #{selectedPacket.id})</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">SOURCE ADDRESS:</span>
                <span className="text-emerald-400 font-mono font-bold">{selectedPacket.srcIp}:{selectedPacket.srcPort}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">TARGET ASSET:</span>
                <span className="text-white font-mono font-bold">{selectedPacket.dstIp}:{selectedPacket.dstPort}</span>
              </div>
            </div>

            {selectedPacket.ruleTriggered && (
              <div className="p-2 rounded bg-red-950/40 border border-red-500/50 text-red-200 text-xs">
                <span className="text-[10px] font-bold text-red-400 uppercase block">FIREWALL RULE TRIGGERED:</span>
                <span className="font-mono text-[11px]">{selectedPacket.ruleTriggered}</span>
              </div>
            )}

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Decoded ASCII Payload:
              </span>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-emerald-300 text-xs break-all leading-relaxed">
                {selectedPacket.payloadAscii}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Raw Hex Dump:</span>
                <button
                  onClick={handleCopyHex}
                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  {copiedHex ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHex ? 'Hex Copied' : 'Copy Hex'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded bg-black/80 border border-slate-800 font-mono text-slate-300 text-[11px] break-all leading-relaxed max-h-[140px] overflow-y-auto">
                {selectedPacket.payloadHex}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => onSelectIpForInvestigation(selectedPacket.srcIp)}
                className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
              >
                <Search className="w-3.5 h-3.5" />
                Trace Source IP in Finder ({selectedPacket.srcIp})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
